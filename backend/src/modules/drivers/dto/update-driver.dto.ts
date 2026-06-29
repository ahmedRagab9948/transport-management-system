import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { VALIDATION, REGEX } from '@tms/shared';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  driverCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.PHONE_MAX_LENGTH)
  @Matches(REGEX.PHONE, { message: 'Invalid phone format' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  @Matches(REGEX.NATIONAL_ID, { message: 'National ID must be 14 digits starting with 2 or 3' })
  nationalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NOTES_MAX_LENGTH)
  notes?: string;
}
