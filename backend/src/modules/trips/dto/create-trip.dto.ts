import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { TripStatus } from '@prisma/client';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  tripNumber!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  fromLocation!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  toLocation!: string;

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
  @IsString()
  @MaxLength(VALIDATION.NOTES_MAX_LENGTH)
  notes?: string;
}
