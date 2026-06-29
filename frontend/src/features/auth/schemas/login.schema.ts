import { z } from 'zod';
import { VALIDATION } from '@tms/shared';

export function createLoginSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    email: z.email(t('validation.invalid_email')),
    password: z.string().min(VALIDATION.PASSWORD_MIN_LENGTH, t('validation.password_min')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
