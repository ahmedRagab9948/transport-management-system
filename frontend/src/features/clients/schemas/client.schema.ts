import { z } from 'zod';

export const clientStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

const optionalTrimmedText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const phoneRegex = /^(\+[1-9]\d{1,14}|01[0125]\d{8})$/;

export function createClientSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t('validation.required', { field: t('clients.company_name') })).max(255),
    contactPerson: z.string().trim().min(1, t('validation.required', { field: t('clients.contact_person') })).max(255),
    email: z.string().trim().max(255).optional().transform((v) => v || undefined).pipe(z.string().email(t('validation.invalid_email')).optional()),
    phone: z.string().trim().max(50).optional().transform((v) => v || undefined).pipe(z.string().regex(phoneRegex, t('validation.invalid_phone')).optional()),
    address: z.string().trim().optional().transform((v) => v || undefined),
    taxNumber: z.string().trim().regex(/^\d+$/, t('validation.invalid_tax_number')).min(9, t('validation.min_length', { field: t('clients.tax_number'), min: 9 })).max(14, t('validation.max_length', { field: t('clients.tax_number'), max: 14 })).optional().transform((v) => v || undefined),
    notes: z.string().trim().optional().transform((v) => v || undefined),
    status: clientStatusSchema.default('ACTIVE'),
  });
}

export function createUpdateClientSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t('validation.required', { field: t('clients.company_name') })).max(255).optional(),
    contactPerson: z.string().trim().min(1, t('validation.required', { field: t('clients.contact_person') })).max(255).optional(),
    email: z.string().trim().max(255).optional().transform((v) => v || undefined).pipe(z.string().email(t('validation.invalid_email')).optional()),
    phone: z.string().trim().max(50).optional().transform((v) => v || undefined).pipe(z.string().regex(phoneRegex, t('validation.invalid_phone')).optional()),
    address: z.string().trim().optional().transform((v) => v || undefined),
    taxNumber: z.string().trim().regex(/^\d+$/, t('validation.invalid_tax_number')).min(9, t('validation.min_length', { field: t('clients.tax_number'), min: 9 })).max(14, t('validation.max_length', { field: t('clients.tax_number'), max: 14 })).optional().transform((v) => v || undefined),
    notes: z.string().trim().optional().transform((v) => v || undefined),
    status: clientStatusSchema.optional(),
  });
}

export type CreateClientFormValues = z.input<ReturnType<typeof createClientSchema>>;
export type CreateClientSubmitValues = z.output<ReturnType<typeof createClientSchema>>;

export type UpdateClientFormValues = z.input<ReturnType<typeof createUpdateClientSchema>>;
export type UpdateClientSubmitValues = z.output<ReturnType<typeof createUpdateClientSchema>>;
