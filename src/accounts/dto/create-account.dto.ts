import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsEqualTo } from '../../decorators/is-equal.decorator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Alias of the account',
    example: 'My account',
  })
  @IsNotEmpty()
  @IsString()
  alias: string;

  @ApiProperty({
    description: 'Pin of the account',
    example: '1234',
  })
  @IsNotEmpty()
  @IsString()
  pin: string;

  @ApiProperty({
    description: 'Pin confirmation of the account',
    example: '1234',
  })
  @IsNotEmpty()
  @IsString()
  @IsEqualTo('pin')
  pinConfirmation: string;
}
