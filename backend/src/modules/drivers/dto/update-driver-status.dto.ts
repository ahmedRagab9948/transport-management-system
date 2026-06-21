import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverStatusDto {
  @IsEnum(DriverStatus)
  status!: DriverStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
