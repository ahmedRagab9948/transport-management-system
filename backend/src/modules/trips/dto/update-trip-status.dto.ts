import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TripStatus } from '@prisma/client';

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  status!: TripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  reasonCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;
}
