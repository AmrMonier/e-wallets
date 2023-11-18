import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountsService } from './accounts.service';
import { UpdateAccountPinDto } from './dto/change-in.dto';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Body() createAccountDto: CreateAccountDto,
    @Req() req: { user: { userId: number; username: string } },
  ) {
    return this.accountsService.create({
      ...createAccountDto,
      userId: req.user.userId,
    });
  }

  @Get()
  findAll(@Req() req: { user: { userId: number; username: string } }) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { userId: number; username: string } },
  ) {
    return this.accountsService.findOne({
      accountUuid: id,
      userId: req.user.userId,
    });
  }

  @Patch(':id/change-pin')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountPinDto,
    @Req() req: { user: { userId: number; username: string } },
  ) {
    await this.accountsService.changeAccountPin({
      ...updateAccountDto,
      userId: req.user.userId,
      accountNumber: id,
    });
    return { message: 'pin changed successfully' };
  }

  @Post(':id/transaction')
  async submitTransaction(
    @Body() payload: SubmitTransactionDto,
    @Req() req: { user: { userId: number; username: string } },
    @Param('id') id: string,
  ) {
    await this.accountsService.submitTransaction({
      ...payload,
      userId: req.user.userId,
      accountNumber: id,
    });
    return {
      message: 'transaction completed successfully',
    };
  }

  @Get(':id/transactions')
  async getAccountTransactions(
    @Param('id') id: string,
    @Req() req: { user: { userId: number; username: string } },
  ) {
    return await this.accountsService.getAccountTransactions({
      accountUuid: id,
      userId: req.user.userId,
    });
  }
}
