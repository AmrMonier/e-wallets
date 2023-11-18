import { Exclude, plainToClass } from 'class-transformer';
import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BaseEntity,
} from 'typeorm';
import { v4 as UUIDV4 } from 'uuid';
@Entity('accounts')
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  alias: string;

  @ManyToOne(() => User, (user: User) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  balance: number;

  @Column({ unique: true })
  accountNumber: string;

  @Column()
  @Exclude()
  pin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateAccountNumber() {
    this.accountNumber = UUIDV4();
  }

  toJSON() {
    return plainToClass(Account, this);
  }
}
