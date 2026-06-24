import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignVehicleDto {
  @IsUUID()
  @IsNotEmpty()
  subSectorId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
