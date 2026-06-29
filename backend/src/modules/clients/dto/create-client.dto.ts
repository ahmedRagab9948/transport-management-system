import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VALIDATION, REGEX } from '@tms/shared';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  contactPerson!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(VALIDATION.EMAIL_MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION.PHONE_MAX_LENGTH)
  @Matches(REGEX.PHONE, { message: 'Invalid phone format' })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(VALIDATION.TAX_NUMBER_MIN_LENGTH)
  @MaxLength(VALIDATION.TAX_NUMBER_MAX_LENGTH)
  @Matches(REGEX.DIGITS_ONLY, { message: 'Tax number must contain only digits' })
  taxNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}
