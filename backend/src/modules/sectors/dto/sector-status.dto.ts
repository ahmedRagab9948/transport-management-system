import { IsEnum, IsNotEmpty } from 'class-validator';
import { RecordStatus } from '@prisma/client';

export class SectorStatusDto {
  @IsEnum(RecordStatus)
  @IsNotEmpty()
  status!: RecordStatus;
}
