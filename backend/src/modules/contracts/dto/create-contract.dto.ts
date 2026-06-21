import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContractStatus, ContractType } from '@prisma/client';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contractNumber!: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fromLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  toLocation?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
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
