import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  alias: string;

  @IsNotEmpty()
  @IsString()
  pin: string;
}
