import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { VehiclePlateRole } from '@prisma/client';

export class VehiclePlateDto {
  @IsEnum(VehiclePlateRole)
  role!: VehiclePlateRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.PLATE_MAX_LENGTH)
  plateNumber!: string;
}
