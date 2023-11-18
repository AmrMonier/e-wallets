import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntity, Repository } from 'typeorm';
import { Account } from './accounts.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateAccountPinDto } from './dto/change-in.dto';
import {
  Transaction,
  TransactionDirection,
  TransactionType,
} from './transactions.entity';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    payload: CreateAccountDto & { userId: number },
  ): Promise<Account> {
    const account = this.accountsRepository.create({
      ...payload,
      pin: await bcrypt.hash(payload.pin, 10),
      balance: 0,
    });
    await this.accountsRepository.save(account);
    return account;
  }

  async findAll(userId: number): Promise<Account[]> {
    return this.accountsRepository.find({ where: { userId } });
  }

  async findOne({
    accountUuid,
    userId,
  }: {
    accountUuid: string;
    userId: number;
  }): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { accountNumber: accountUuid, userId },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async changeAccountPin(
    payload: UpdateAccountPinDto & { userId: number; accountNumber: string },
  ) {
    const account = await this.findOne({
      accountUuid: payload.accountNumber,
      userId: payload.userId,
    });
    if (!(await bcrypt.compare(payload.pin, account.pin)))
      throw new ForbiddenException('Wrong Pin');
    account.pin = await bcrypt.hash(payload.newPin, 10);
    await account.save();
  }

  async submitTransaction(
    payload: SubmitTransactionDto & { userId: number; accountNumber: string },
  ) {
    await this.accountsRepository.manager.transaction(async (manager) => {
      const sourceAccount = await manager.findOne(Account, {
        where: {
          accountNumber: payload.accountNumber,
          userId: payload.userId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      if (!sourceAccount)
        throw new NotFoundException('Source Account Not Found');
      if (!(await bcrypt.compare(payload.pin, sourceAccount.pin)))
        throw new ForbiddenException('Wrong Pin');

      switch (payload.transactionType) {
        case TransactionType.DEPOSIT: {
          return manager.save(
            this.deposit({
              account: sourceAccount,
              amount: payload.amount,
              notes: payload.notes,
            }),
          );
        }
        case TransactionType.WITHDRAWAL:
          return await manager.save(
            this.withdrawal({
              account: sourceAccount,
              amount: payload.amount,
              notes: payload.notes,
            }),
          );
        case TransactionType.TRANSFER:
          const targetAccount = await manager.findOne(Account, {
            where: { accountNumber: payload.transferTo },
          });
          if (!targetAccount)
            throw new BadRequestException('Target Account not Found');
          return await manager.save(
            this.transfer({
              sourceAccount,
              targetAccount,
              amount: payload.amount,
              notes: payload.notes,
            }),
          );
      }
    });
  }

  async getAccountTransactions({
    accountUuid,
    userId,
  }: {
    accountUuid: string;
    userId: number;
  }) {
    const account = await this.findOne({ accountUuid, userId });
    return this.transactionRepository.find({
      where: { accountId: account.id },
      order: { createdAt: 'DESC' },
    });
  }
  private deposit({
    account,
    amount,
    notes,
  }: {
    amount: number;
    notes?: string;
    account: Account;
  }): BaseEntity[] {
    account.balance = account.balance + amount;
    const trx = Transaction.create({
      accountId: account.id,
      amount,
      type: TransactionType.DEPOSIT,
      notes,
      direction: TransactionDirection.IN,
    });

    return [account, trx];
  }
  private withdrawal({
    account,
    amount,
    notes,
  }: {
    amount: number;
    notes?: string;
    account: Account;
  }): BaseEntity[] {
    if (account.balance < amount)
      throw new ForbiddenException('Insufficient balance');
    account.balance -= amount;
    const trx = Transaction.create({
      account,
      amount,
      notes,
      type: TransactionType.WITHDRAWAL,
      direction: TransactionDirection.OUT,
    });
    return [account, trx];
  }

  private transfer({
    sourceAccount,
    targetAccount,
    amount,
    notes,
  }: {
    amount: number;
    notes?: string;
    sourceAccount: Account;
    targetAccount: Account;
  }): BaseEntity[] {
    if (sourceAccount.balance < amount)
      throw new ForbiddenException('Insufficient balance');
    sourceAccount.balance -= amount;
    targetAccount.balance += amount;
    const sourceTrx = Transaction.create({
      account: sourceAccount,
      amount,
      notes,
      type: TransactionType.TRANSFER,
      relatedAccount: targetAccount,
      direction: TransactionDirection.OUT,
    });

    const targetTrx = Transaction.create({
      accountId: targetAccount.id,
      amount,
      notes,
      type: TransactionType.TRANSFER,
      relatedAccountId: sourceAccount.id,
      direction: TransactionDirection.IN,
    });
    return [sourceAccount, targetAccount, sourceTrx, targetTrx];
  }
}
