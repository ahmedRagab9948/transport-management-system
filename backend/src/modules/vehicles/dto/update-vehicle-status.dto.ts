import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleStatusDto {
  @IsEnum(VehicleStatus)
  status!: VehicleStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
