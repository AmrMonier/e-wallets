import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './accounts.entity';
import { Transaction } from './transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction])],
  providers: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
