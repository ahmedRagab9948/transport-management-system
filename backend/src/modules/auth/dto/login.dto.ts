import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(VALIDATION.PASSWORD_MIN_LENGTH)
  password!: string;
}
