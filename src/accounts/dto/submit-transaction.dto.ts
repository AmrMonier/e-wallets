import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../transactions.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class SubmitTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    description: 'The type of transaction',
    example: TransactionType.DEPOSIT,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiPropertyOptional({
    description: 'Optional notes for the transaction',
    example: 'Birthday gift deposit',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'The transaction amount',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'The account PIN',
    example: '1234',
  })
  @IsNotEmpty()
  @IsString()
  pin: string;

  @ApiProperty({
    description: 'Account UUID to transfer funds to (for transfers only)',
  })
  @ValidateIf(
    (obj: SubmitTransactionDto) =>
      obj.transactionType === TransactionType.TRANSFER,
  )
  @IsUUID('4')
  @IsNotEmpty()
  transferTo?: string;

  @ApiProperty({
    description: 'the otp from your authenticator',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
