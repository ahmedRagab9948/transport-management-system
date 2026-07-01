import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  applicationName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  timeFormat?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  rtlPreview?: string;

  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @IsOptional()
  @IsString()
  supportedLanguages?: string;

  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  numberFormat?: string;

  @IsOptional()
  @IsString()
  emailNotifications?: string;

  @IsOptional()
  @IsString()
  inAppNotifications?: string;

  @IsOptional()
  @IsString()
  smsEnabled?: string;

  @IsOptional()
  @IsString()
  sessionTimeout?: string;

  @IsOptional()
  @IsString()
  loginAlerts?: string;

  @IsOptional()
  @IsString()
  passwordExpiration?: string;

  @IsOptional()
  @IsString()
  passwordMinLength?: string;

  @IsOptional()
  @IsString()
  passwordRequireUppercase?: string;

  @IsOptional()
  @IsString()
  passwordRequireNumbers?: string;

  @IsOptional()
  @IsString()
  passwordRequireSymbols?: string;

  @IsOptional()
  @IsString()
  maxLoginAttempts?: string;

  @IsOptional()
  @IsString()
  lockoutDuration?: string;

  @IsOptional()
  @IsString()
  mfaEnabled?: string;
}
