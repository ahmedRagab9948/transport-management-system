import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.SECTOR_CODE_MAX_LENGTH)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
