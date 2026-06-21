import { z } from 'zod';

export function createResetPasswordSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    password: z.string().min(8, t('validation.password_min_length')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwords_mismatch'),
    path: ['confirmPassword'],
  });
}

export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
