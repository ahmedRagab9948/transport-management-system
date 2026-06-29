import { IsArray, IsBoolean, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@tms/shared';

export class QueryNotificationsDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = DEFAULT_PAGE;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = DEFAULT_PAGE_SIZE;

  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
}

export class MarkReadDto {
  @IsArray()
  @IsString({ each: true })
  notificationIds!: string[];
}
