import { IsDateString, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}

export class ReportQueryDto extends DateRangeDto {
  @IsString()
  @MaxLength(VALIDATION.PERIOD_MAX_LENGTH)
  @IsOptional()
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export class TopClientsQueryDto extends DateRangeDto {
  @IsInt()
  @Min(1)
  @Max(VALIDATION.REPORT_TOP_CLIENTS_MAX)
  @IsOptional()
  limit?: number;
}

export class ClientReportQueryDto extends DateRangeDto {
  @IsString()
  @IsOptional()
  clientId?: string;
}
