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
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactPerson!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^(\+[1-9]\d{1,14}|01[0125]\d{8})$/, { message: 'Invalid phone format' })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(14)
  @Matches(/^\d+$/, { message: 'Tax number must contain only digits' })
  taxNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}
