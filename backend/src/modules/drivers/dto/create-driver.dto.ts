import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VALIDATION, REGEX } from '@tms/shared';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  driverCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.PHONE_MAX_LENGTH)
  @Matches(REGEX.PHONE, { message: 'Invalid phone format' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  @Matches(REGEX.NATIONAL_ID, { message: 'National ID must be 14 digits starting with 2 or 3' })
  nationalId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  licenseNumber!: string;

  @IsDateString()
  licenseExpiry!: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NOTES_MAX_LENGTH)
  notes?: string;
}
