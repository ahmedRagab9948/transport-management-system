import { IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';
import { VALIDATION, REGEX } from '@tms/shared';

export class VerifyOtpDto {
  @IsUUID()
  @IsNotEmpty()
  otpSessionId!: string;

  @IsString()
  @Length(VALIDATION.OTP_LENGTH, VALIDATION.OTP_LENGTH)
  @Matches(REGEX.OTP, { message: 'code must be a 6-digit number' })
  code!: string;
}
