import { z } from 'zod';
import { VALIDATION } from '@tms/shared';

export function createResetPasswordSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    password: z.string().min(VALIDATION.PASSWORD_MIN_LENGTH, t('validation.password_min_length')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwords_mismatch'),
    path: ['confirmPassword'],
  });
}

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
