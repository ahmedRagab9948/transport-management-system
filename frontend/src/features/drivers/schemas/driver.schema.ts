import { z } from 'zod';

export const driverStatusSchema = z.enum(['ACTIVE', 'IN_TRIP', 'INACTIVE', 'SUSPENDED']);

const optionalTrimmedText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const phoneRegex = /^(\+[1-9]\d{1,14}|01[0125]\d{8})$/;
const nationalIdRegex = /^[2-3]\d{13}$/;

export function createDriverSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    driverCode: z.string().trim().min(1, t('validation.required', { field: t('drivers.driver_code') })).max(100),
    fullName: z.string().trim().min(1, t('validation.required', { field: t('drivers.full_name') })).max(255),
    phone: z.string().trim().regex(phoneRegex, t('validation.invalid_phone')),
    nationalId: z.string().trim().regex(nationalIdRegex, t('validation.invalid_national_id')),
    licenseNumber: z.string().trim().min(1, t('validation.required', { field: t('drivers.license_number') })).max(100),
    licenseExpiry: z.string().min(1, t('validation.required', { field: t('drivers.license_expiry') })).refine(
      (val) => new Date(val) > new Date(),
      t('validation.date_must_be_future')
    ),
    status: driverStatusSchema.default('ACTIVE'),
    notes: optionalTrimmedText,
  });
}

export function createUpdateDriverSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    driverCode: z.string().trim().min(1, t('validation.required', { field: t('drivers.driver_code') })).max(100).optional(),
    fullName: z.string().trim().min(1, t('validation.required', { field: t('drivers.full_name') })).max(255).optional(),
    phone: z.string().trim().regex(phoneRegex, t('validation.invalid_phone')).optional(),
    nationalId: z.string().trim().regex(nationalIdRegex, t('validation.invalid_national_id')).optional(),
    licenseNumber: z.string().trim().min(1, t('validation.required', { field: t('drivers.license_number') })).max(100).optional(),
    licenseExpiry: z.string().min(1, t('validation.required', { field: t('drivers.license_expiry') })).optional().refine(
      (val) => {
        if (!val) return true;
        return new Date(val) > new Date();
      },
      t('validation.date_must_be_future')
    ),
    status: driverStatusSchema.optional(),
    notes: optionalTrimmedText,
  });
}

export type CreateDriverFormValues = z.input<ReturnType<typeof createDriverSchema>>;
export type CreateDriverSubmitValues = z.output<ReturnType<typeof createDriverSchema>>;

export type UpdateDriverFormValues = z.input<ReturnType<typeof createUpdateDriverSchema>>;
export type UpdateDriverSubmitValues = z.output<ReturnType<typeof createUpdateDriverSchema>>;
