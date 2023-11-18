import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { Account } from './accounts.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionType } from './transactions.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountsRepository: Repository<Account>;
  let transactionsRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            manager: {
              transaction: jest
                .fn()
                .mockImplementation(async (transactionalEntityManager) => {
                  transactionalEntityManager.save = jest.fn(); // Mock save
                  transactionalEntityManager.findOne = jest.fn(); // Mock findOne

                  await transactionalEntityManager();
                }),
            },
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();
    jest.spyOn(bcrypt, 'hash').mockImplementation((pin, rounds) => {
      return 'hashedPassword';
    });

    service = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    transactionsRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should hash the pin', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      const payload = {
        userId: 1,
        pin: '1234',
        alias: 'test',
      };

      await service.create(payload);

      expect(hashSpy).toHaveBeenCalledWith(payload.pin, 10);
    });

    it('should save the account', async () => {
      const saveSpy = jest.spyOn(accountsRepository, 'save');

      const payload = {
        userId: 1,
        pin: '1234',
        alias: 'test',
      };

      await service.create(payload);

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should return the account', async () => {
      jest
        .spyOn(accountsRepository, 'create')
        .mockImplementationOnce(() => new Account());
      const account = await service.create({
        userId: 1,
        pin: '1234',
        alias: 'test',
      });
      expect(account).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call accountsRepository.find with the correct userId', async () => {
      const findSpy = jest.spyOn(accountsRepository, 'find');
      const userId = 1;

      await service.findAll(userId);

      expect(findSpy).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return the found accounts', async () => {
      const accounts = [{ id: 1 }, { id: 2 }] as Account[];
      jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(accounts);

      const result = await service.findAll(1);

      expect(result).toEqual(accounts);
    });
  });

  describe('findOne', () => {
    it('should call findOne on repository', async () => {
      const findOneSpy = jest.spyOn(accountsRepository, 'findOne');
      findOneSpy.mockResolvedValueOnce(new Account());
      await service.findOne({
        accountUuid: '123',
        userId: 1,
      });

      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          accountNumber: '123',
          userId: 1,
        },
      });
    });

    it('should throw error if account not found', async () => {
      jest
        .spyOn(accountsRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      await expect(
        service.findOne({
          accountUuid: '123',
          userId: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the account if found', async () => {
      const account = new Account();
      jest.spyOn(accountsRepository, 'findOne').mockResolvedValueOnce(account);

      const result = await service.findOne({
        accountUuid: '123',
        userId: 1,
      });

      expect(result).toEqual(account);
    });
  });

  describe('changeAccountPin', () => {
    it('should get the account', async () => {
      const account = new Account();
      account.pin = 'xxxx-xxxx-xxxx';
      account.save = jest.fn();
      const findOneSpy = jest
        .spyOn(accountsRepository, 'findOne')
        .mockResolvedValueOnce(account);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);

      await service.changeAccountPin({
        accountNumber: '123',
        userId: 1,
        pin: '1234',
        newPin: '5678',
        newPinConfirmation: '5678',
      });

      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          accountNumber: '123',
          userId: 1,
        },
      });
    });

    it('should throw error if pin is wrong', async () => {
      const account = new Account();
      jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => false);
      await expect(
        service.changeAccountPin({
          accountNumber: '123',
          userId: 1,
          pin: '1234',
          newPin: '5678',
          newPinConfirmation: '5678',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update pin if correct', async () => {
      const account = new Account();
      account.pin = await bcrypt.hash('1234', 10);
      account.save = jest.fn();
      jest.spyOn(accountsRepository, 'findOne').mockResolvedValue(account);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);

      await service.changeAccountPin({
        accountNumber: '123',
        userId: 1,
        pin: '1234',
        newPin: '5678',
        newPinConfirmation: '5678',
      });

      expect(account.pin).toEqual(await bcrypt.hash('5678', 10));
      expect(account.save).toHaveBeenCalled();
    });
  });

  describe('getAccountTransactions', () => {
    it('should get the account', async () => {
      const findOneSpy = jest
        .spyOn(accountsRepository, 'findOne')
        .mockResolvedValueOnce(new Account());

      await service.getAccountTransactions({
        accountUuid: '123',
        userId: 1,
      });

      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          accountNumber: '123',
          userId: 1,
        },
      });
    });

    it('should call transactionRepo.find with correct params', async () => {
      const account = new Account();
      account.id = 1;

      jest.spyOn(accountsRepository, 'findOne').mockResolvedValueOnce(account);

      const findSpy = jest.spyOn(transactionsRepository, 'find');

      await service.getAccountTransactions({
        accountUuid: '123',
        userId: 1,
      });

      expect(findSpy).toHaveBeenCalledWith({
        where: { accountId: account.id },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return the transactions', async () => {
      const transactions = [{ id: 1 }, { id: 2 }] as Transaction[];
      const account = new Account();
      account.id = 1;

      jest.spyOn(accountsRepository, 'findOne').mockResolvedValueOnce(account);
      jest
        .spyOn(transactionsRepository, 'find')
        .mockResolvedValueOnce(transactions);

      const result = await service.getAccountTransactions({
        accountUuid: '123',
        userId: 1,
      });

      expect(result).toEqual(transactions);
    });
  });
});
