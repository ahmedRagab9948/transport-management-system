import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  driverCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^(\+[1-9]\d{1,14}|01[0125]\d{8})$/, { message: 'Invalid phone format' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[2-3]\d{13}$/, { message: 'National ID must be 14 digits starting with 2 or 3' })
  nationalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
