import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION.PASSWORD_MIN_LENGTH)
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
