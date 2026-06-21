import { IsArray, IsBoolean, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotificationsDto {
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
}

export class MarkReadDto {
  @IsArray()
  @IsString({ each: true })
  notificationIds!: string[];
}
