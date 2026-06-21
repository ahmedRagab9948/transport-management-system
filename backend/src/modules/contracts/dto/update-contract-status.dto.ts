import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus)
  status!: ContractStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
