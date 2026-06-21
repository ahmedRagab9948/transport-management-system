import { z } from 'zod';

export function createOtpSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    code: z
      .string()
      .length(6, t('validation.code_6_digits'))
      .regex(/^\d{6}$/, t('validation.numbers_only')),
  });
}

export type OtpFormValues = z.infer<ReturnType<typeof createOtpSchema>>;
