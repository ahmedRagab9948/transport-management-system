import { z } from 'zod';
import { CLIENT_STATUS, VALIDATION, REGEX } from '@tms/shared';

export const clientStatusSchema = z.nativeEnum(CLIENT_STATUS);

export function createClientSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t('validation.required', { field: t('clients.company_name') })).max(VALIDATION.NAME_MAX_LENGTH),
    contactPerson: z.string().trim().min(1, t('validation.required', { field: t('clients.contact_person') })).max(VALIDATION.NAME_MAX_LENGTH),
    email: z.string().trim().max(VALIDATION.EMAIL_MAX_LENGTH).optional().transform((v) => v || undefined).pipe(z.string().email(t('validation.invalid_email')).optional()),
    phone: z.string().trim().max(VALIDATION.PHONE_MAX_LENGTH).optional().transform((v) => v || undefined).pipe(z.string().regex(REGEX.PHONE, t('validation.invalid_phone')).optional()),
    address: z.string().trim().optional().transform((v) => v || undefined),
    taxNumber: z.string().trim().regex(REGEX.DIGITS_ONLY, t('validation.invalid_tax_number')).min(VALIDATION.TAX_NUMBER_MIN_LENGTH, t('validation.min_length', { field: t('clients.tax_number'), min: VALIDATION.TAX_NUMBER_MIN_LENGTH })).max(VALIDATION.TAX_NUMBER_MAX_LENGTH, t('validation.max_length', { field: t('clients.tax_number'), max: VALIDATION.TAX_NUMBER_MAX_LENGTH })).optional().transform((v) => v || undefined),
    notes: z.string().trim().optional().transform((v) => v || undefined),
    status: clientStatusSchema.default('ACTIVE'),
  });
}

export function createUpdateClientSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t('validation.required', { field: t('clients.company_name') })).max(VALIDATION.NAME_MAX_LENGTH).optional(),
    contactPerson: z.string().trim().min(1, t('validation.required', { field: t('clients.contact_person') })).max(VALIDATION.NAME_MAX_LENGTH).optional(),
    email: z.string().trim().max(VALIDATION.EMAIL_MAX_LENGTH).optional().transform((v) => v || undefined).pipe(z.string().email(t('validation.invalid_email')).optional()),
    phone: z.string().trim().max(VALIDATION.PHONE_MAX_LENGTH).optional().transform((v) => v || undefined).pipe(z.string().regex(REGEX.PHONE, t('validation.invalid_phone')).optional()),
    address: z.string().trim().optional().transform((v) => v || undefined),
    taxNumber: z.string().trim().regex(REGEX.DIGITS_ONLY, t('validation.invalid_tax_number')).min(VALIDATION.TAX_NUMBER_MIN_LENGTH, t('validation.min_length', { field: t('clients.tax_number'), min: VALIDATION.TAX_NUMBER_MIN_LENGTH })).max(VALIDATION.TAX_NUMBER_MAX_LENGTH, t('validation.max_length', { field: t('clients.tax_number'), max: VALIDATION.TAX_NUMBER_MAX_LENGTH })).optional().transform((v) => v || undefined),
    notes: z.string().trim().optional().transform((v) => v || undefined),
    status: clientStatusSchema.optional(),
  });
}

export type CreateClientFormValues = z.input<ReturnType<typeof createClientSchema>>;
export type CreateClientSubmitValues = z.output<ReturnType<typeof createClientSchema>>;

export type UpdateClientFormValues = z.input<ReturnType<typeof createUpdateClientSchema>>;
export type UpdateClientSubmitValues = z.output<ReturnType<typeof createUpdateClientSchema>>;
