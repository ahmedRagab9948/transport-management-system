import { IsNotEmpty, IsUUID } from 'class-validator';

export class ResendOtpDto {
  @IsUUID()
  @IsNotEmpty()
  otpSessionId!: string;
}
