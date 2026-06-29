export const REGEX = {
  PHONE: /^(\+[1-9]\d{1,14}|01[0125]\d{8})$/,
  DIGITS_ONLY: /^\d+$/,
  NATIONAL_ID: /^[2-3]\d{13}$/,
  OTP: /^\d{6}$/,
} as const;
