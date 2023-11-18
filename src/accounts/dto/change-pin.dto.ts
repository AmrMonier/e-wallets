import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsEqualTo } from '../../decorators/is-equal.decorator';

export class UpdateAccountPinDto {
  @ApiProperty({
    description: "The user's current account PIN",
    example: '1234',
  })
  @IsNotEmpty()
  @IsString()
  pin: string;

  @ApiProperty({
    description: 'The new PIN the user wants to set',
    example: '5678',
  })
  @IsNotEmpty()
  @IsString()
  newPin: string;

  @ApiProperty({
    description: 'Confirmation of the new PIN',
    example: '5678',
  })
  @IsNotEmpty()
  @IsString()
  @IsEqualTo('newPin')
  newPinConfirmation: string;
}
