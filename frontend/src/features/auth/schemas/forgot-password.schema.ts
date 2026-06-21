import { z } from 'zod';

export function createForgotPasswordSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    email: z.email(t('validation.invalid_email')),
  });
}

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
