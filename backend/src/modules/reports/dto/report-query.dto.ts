import { IsDateString, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

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
  @MaxLength(50)
  @IsOptional()
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export class TopClientsQueryDto extends DateRangeDto {
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class ClientReportQueryDto extends DateRangeDto {
  @IsString()
  @IsOptional()
  clientId?: string;
}
