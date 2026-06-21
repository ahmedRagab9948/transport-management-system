import { IsDateString, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAuditLogsDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  entityType?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
