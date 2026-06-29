import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { TripStatus } from '@prisma/client';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  tripNumber?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  fromLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  toLocation?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CARGO_DESC_MAX_LENGTH)
  cargoDescription?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NOTES_MAX_LENGTH)
  notes?: string;
}
