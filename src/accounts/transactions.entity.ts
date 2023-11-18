import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { Account } from './accounts.entity';
// Ensure this import points to your Account entity

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}
export enum TransactionDirection {
  IN = 'in',
  OUT = 'out',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: false,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionDirection,
    nullable: false,
  })
  direction: TransactionDirection;

  @Column()
  amount: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  relatedAccountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'related_account_id' })
  relatedAccount: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
