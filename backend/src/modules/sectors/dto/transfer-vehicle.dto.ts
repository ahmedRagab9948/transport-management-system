import { IsNotEmpty, IsUUID } from 'class-validator';

export class TransferVehicleDto {
  @IsUUID()
  @IsNotEmpty()
  targetSubSectorId: string;
}
