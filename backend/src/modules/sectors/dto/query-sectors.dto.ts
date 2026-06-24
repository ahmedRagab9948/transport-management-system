import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RecordStatus } from '@prisma/client';

export class QuerySectorsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
