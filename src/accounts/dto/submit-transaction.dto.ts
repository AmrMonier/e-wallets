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
import { TransactionType } from '../transactions.entity';

export class SubmitTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  pin: string;

  @ValidateIf(
    (obj: SubmitTransactionDto) =>
      obj.transactionType === TransactionType.TRANSFER,
  )
  @IsUUID('4')
  @IsNotEmpty()
  transferTo?: string;
}
