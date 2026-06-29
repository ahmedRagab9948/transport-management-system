import { IsDateString, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, VALIDATION } from '@tms/shared';

export class QueryAuditLogsDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = DEFAULT_PAGE;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = DEFAULT_PAGE_SIZE;

  @IsString()
  @MaxLength(VALIDATION.ENTITY_TYPE_MAX_LENGTH)
  @IsOptional()
  entityType?: string;

  @IsString()
  @MaxLength(VALIDATION.ACTION_MAX_LENGTH)
  @IsOptional()
  action?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @MaxLength(VALIDATION.SEARCH_MAX_LENGTH)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
