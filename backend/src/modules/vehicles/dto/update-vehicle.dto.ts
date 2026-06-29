import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { VehicleType } from '@prisma/client';
import { VehiclePlateDto } from './vehicle-plate.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  vehicleCode?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

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

  @IsOptional()
  @IsArray()
  @ArrayMinSize(VALIDATION.PLATES_MIN_SIZE)
  @ArrayMaxSize(VALIDATION.PLATES_MAX_SIZE)
  @ValidateNested({ each: true })
  @Type(() => VehiclePlateDto)
  plates?: VehiclePlateDto[];
}
