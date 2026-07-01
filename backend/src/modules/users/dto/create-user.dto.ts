import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  otpEnabled?: boolean;
}
