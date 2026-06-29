import { z } from 'zod';
import { DRIVER_STATUS, VALIDATION, REGEX } from '@tms/shared';
import { optionalTrimmedText } from '@/lib/forms';

export const driverStatusSchema = z.nativeEnum(DRIVER_STATUS);

export function createDriverSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    driverCode: z.string().trim().min(1, t('validation.required', { field: t('drivers.driver_code') })).max(VALIDATION.CODE_MAX_LENGTH),
    fullName: z.string().trim().min(1, t('validation.required', { field: t('drivers.full_name') })).max(VALIDATION.NAME_MAX_LENGTH),
    phone: z.string().trim().regex(REGEX.PHONE, t('validation.invalid_phone')),
    nationalId: z.string().trim().regex(REGEX.NATIONAL_ID, t('validation.invalid_national_id')),
    licenseNumber: z.string().trim().min(1, t('validation.required', { field: t('drivers.license_number') })).max(VALIDATION.CODE_MAX_LENGTH),
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
    driverCode: z.string().trim().min(1, t('validation.required', { field: t('drivers.driver_code') })).max(VALIDATION.CODE_MAX_LENGTH).optional(),
    fullName: z.string().trim().min(1, t('validation.required', { field: t('drivers.full_name') })).max(VALIDATION.NAME_MAX_LENGTH).optional(),
    phone: z.string().trim().regex(REGEX.PHONE, t('validation.invalid_phone')).optional(),
    nationalId: z.string().trim().regex(REGEX.NATIONAL_ID, t('validation.invalid_national_id')).optional(),
    licenseNumber: z.string().trim().min(1, t('validation.required', { field: t('drivers.license_number') })).max(VALIDATION.CODE_MAX_LENGTH).optional(),
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
