import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VehiclePlateRole } from '@prisma/client';

export class VehiclePlateDto {
  @IsEnum(VehiclePlateRole)
  role!: VehiclePlateRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  plateNumber!: string;
}
