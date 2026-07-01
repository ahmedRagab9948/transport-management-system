import { z } from 'zod';
import { VALIDATION } from '@tms/shared';

export function createUserSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    fullName: z.string().trim().min(1, t('validation.required', { field: t('users.full_name') })).max(VALIDATION.NAME_MAX_LENGTH),
    email: z.string().email(t('validation.invalid_email')),
    password: z.string().min(VALIDATION.PASSWORD_MIN_LENGTH, t('validation.password_min_length', { min: VALIDATION.PASSWORD_MIN_LENGTH })),
    phone: z.string().optional(),
    roleId: z.string().min(1, t('validation.required', { field: t('users.role') })),
    isActive: z.boolean().default(true),
    otpEnabled: z.boolean().default(true),
  });
}

export function updateUserSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    fullName: z.string().trim().min(1, t('validation.required', { field: t('users.full_name') })).max(VALIDATION.NAME_MAX_LENGTH).optional(),
    email: z.string().email(t('validation.invalid_email')).optional(),
    phone: z.string().optional(),
    roleId: z.string().min(1, t('validation.required', { field: t('users.role') })).optional(),
    isActive: z.boolean().optional(),
    otpEnabled: z.boolean().optional(),
  });
}

export type CreateUserFormValues = z.input<ReturnType<typeof createUserSchema>>;
export type CreateUserSubmitValues = z.output<ReturnType<typeof createUserSchema>>;

export type UpdateUserFormValues = z.input<ReturnType<typeof updateUserSchema>>;
export type UpdateUserSubmitValues = z.output<ReturnType<typeof updateUserSchema>>;
