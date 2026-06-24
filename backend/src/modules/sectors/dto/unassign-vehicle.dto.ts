import { IsOptional, IsString } from 'class-validator';

export class UnassignVehicleDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
