import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Middle name of the user',
    example: 'Doe',
  })
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Birth date of the user',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate: Date;
  @ApiProperty({
    description: 'user password, must be at least 8 characters',
    example: '987654321',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 0,
    minNumbers: 0,
    minLowercase: 0,
    minSymbols: 0,
  })
  password: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'johndoe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'National ID of the user',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsString()
  nationalId: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+201027200070',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'abc@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
