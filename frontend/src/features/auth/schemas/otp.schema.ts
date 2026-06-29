import { z } from 'zod';
import { VALIDATION, REGEX } from '@tms/shared';

export function createOtpSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    code: z
      .string()
      .length(VALIDATION.OTP_LENGTH, t('validation.code_6_digits'))
      .regex(REGEX.OTP, t('validation.numbers_only')),
  });
}

export type OtpFormValues = z.infer<ReturnType<typeof createOtpSchema>>;
