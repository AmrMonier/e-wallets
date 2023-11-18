import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsEqualTo } from 'src/decorators/is-equal.decorator';

export class UpdateAccountPinDto {
  @IsNotEmpty()
  @IsString()
  pin: string;

  @IsNotEmpty()
  @IsString()
  newPin: string;

  @IsNotEmpty()
  @IsString()
  @IsEqualTo('newPin', {
    message: 'pin confirmation does not match password',
  })
  newPinConfirmation: string;
}
