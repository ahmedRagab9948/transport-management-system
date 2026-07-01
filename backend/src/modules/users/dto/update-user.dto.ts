import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  otpEnabled?: boolean;
}
