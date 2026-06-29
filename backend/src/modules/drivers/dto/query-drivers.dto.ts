import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@tms/shared';
import { DriverStatus } from '@prisma/client';

export class QueryDriversDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = DEFAULT_PAGE;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit = DEFAULT_PAGE_SIZE;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  availableOnly?: boolean;
}
