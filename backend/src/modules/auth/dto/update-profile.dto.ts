import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { VALIDATION } from '@tms/shared';

const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES, { message: 'preferredLanguage must be "ar" or "en"' })
  preferredLanguage?: string;
}
