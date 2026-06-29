import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { TripStatus } from '@prisma/client';

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  status!: TripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.REASON_CODE_MAX_LENGTH)
  reasonCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;
}
