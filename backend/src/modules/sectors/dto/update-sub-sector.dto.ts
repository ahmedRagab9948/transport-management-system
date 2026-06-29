import { IsOptional, IsString, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class UpdateSubSectorDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.SECTOR_CODE_MAX_LENGTH)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
