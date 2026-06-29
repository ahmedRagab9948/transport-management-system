import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { VALIDATION } from '@tms/shared';
import { ContractStatus, ContractType } from '@prisma/client';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CODE_MAX_LENGTH)
  contractNumber?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  fromLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.LOCATION_MAX_LENGTH)
  toLocation?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.CURRENCY_MAX_LENGTH)
  currency?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  assignedVehicleId?: string;

  @IsOptional()
  @IsString()
  assignedDriverId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
