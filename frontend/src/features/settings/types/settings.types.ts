export interface SettingsGroup {
  [key: string]: string;
}

export interface Settings {
  General: SettingsGroup;
  Localization: SettingsGroup;
  Notifications: SettingsGroup;
  Security: SettingsGroup;
  System: SettingsGroup;
}

export interface UpdateSettingsPayload {
  applicationName?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyLogo?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  language?: string;
  rtlPreview?: string;
  defaultLanguage?: string;
  supportedLanguages?: string;
  defaultCurrency?: string;
  country?: string;
  numberFormat?: string;
  emailNotifications?: string;
  inAppNotifications?: string;
  smsEnabled?: string;
  sessionTimeout?: string;
  loginAlerts?: string;
  passwordExpiration?: string;
  passwordMinLength?: string;
  passwordRequireUppercase?: string;
  passwordRequireNumbers?: string;
  passwordRequireSymbols?: string;
  maxLoginAttempts?: string;
  lockoutDuration?: string;
  mfaEnabled?: string;
}
