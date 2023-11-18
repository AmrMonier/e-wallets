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
import { UpdateAccountPinDto } from './dto/change-pin.dto';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('accounts')
@ApiTags('Accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new account for the user',
  })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created',
  })
  @ApiBody({
    type: CreateAccountDto,
  })
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
  @ApiOperation({
    summary: 'Get all accounts for user',
  })
  @ApiResponse({
    status: 200,
    description: 'The accounts have been successfully returned',
  })
  findAll(@Req() req: { user: { userId: number; username: string } }) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully returned',
  })
  @ApiParam({
    name: 'id',
    description: 'The account UUID',
  })
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
  @ApiOperation({
    summary: 'Update account PIN',
  })
  @ApiParam({
    name: 'id',
    description: 'The account UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'The account PIN has been successfully updated',
  })
  @ApiBody({
    type: UpdateAccountPinDto,
  })
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
  @ApiOperation({
    summary: 'Submit a transaction for an account',
  })
  @ApiResponse({
    status: 200,
    description: 'The transaction has been successfully submitted',
  })
  @ApiBody({
    type: SubmitTransactionDto,
  })
  @ApiParam({
    name: 'id',
    description: 'The account UUID',
  })
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
  @ApiOperation({
    summary: 'Get all transactions for an account',
  })
  @ApiResponse({
    status: 200,
    description: 'The transactions have been successfully returned',
  })
  @ApiParam({
    name: 'id',
    description: 'The account UUID',
  })
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
