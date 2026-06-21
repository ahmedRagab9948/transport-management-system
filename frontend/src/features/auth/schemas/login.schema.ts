import { z } from 'zod';

export function createLoginSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    email: z.email(t('validation.invalid_email')),
    password: z.string().min(8, t('validation.password_min')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
