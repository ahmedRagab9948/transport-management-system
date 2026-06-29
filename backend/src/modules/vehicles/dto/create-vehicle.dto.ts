import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { VehicleStatus, VehicleType } from '@prisma/client';
import { VehiclePlateDto } from './vehicle-plate.dto';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  vehicleCode!: string;

  @IsEnum(VehicleType)
  type!: VehicleType;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(VALIDATION.PRODUCTION_YEAR_MIN)
  @Max(VALIDATION.PRODUCTION_YEAR_MAX)
  productionYear?: number;

  @IsOptional()
  @IsInt()
  @Min(VALIDATION.CAPACITY_MIN)
  capacityKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedDriverId?: string;

  @IsArray()
  @ArrayMinSize(VALIDATION.PLATES_MIN_SIZE)
  @ArrayMaxSize(VALIDATION.PLATES_MAX_SIZE)
  @ValidateNested({ each: true })
  @Type(() => VehiclePlateDto)
  plates!: VehiclePlateDto[];
}
