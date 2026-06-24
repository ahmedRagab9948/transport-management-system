import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
