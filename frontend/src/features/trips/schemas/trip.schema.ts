import { z } from 'zod';
import { TRIP_STATUS, VALIDATION } from '@tms/shared';
import { optionalTrimmedText } from '@/lib/forms';

export const tripStatusSchema = z.nativeEnum(TRIP_STATUS);

export function createTripSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    tripNumber: z.string().trim().min(1, t('validation.required', { field: t('trips.trip_number') })).max(VALIDATION.CODE_MAX_LENGTH),
    clientId: z.string().min(1, t('validation.required', { field: t('clients.title') })),
    contractId: z.string().min(1, t('validation.required', { field: t('trips.contract') })),
    vehicleId: z.string().min(1, t('validation.required', { field: t('trips.vehicle') })),
    driverId: z.string().min(1, t('validation.required', { field: t('trips.driver') })),
    fromLocation: z.string().trim().min(1, t('validation.required', { field: t('trips.from_location') })).max(VALIDATION.LOCATION_MAX_LENGTH),
    toLocation: z.string().trim().min(1, t('validation.required', { field: t('trips.to_location') })).max(VALIDATION.LOCATION_MAX_LENGTH),
    status: tripStatusSchema.default('PENDING'),
    cargoDescription: optionalTrimmedText,
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    notes: optionalTrimmedText,
  }).refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    { message: t('validation.end_date_after_start'), path: ['endDate'] }
  );
}

export function createUpdateTripSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    tripNumber: z.string().trim().min(1, t('validation.required', { field: t('trips.trip_number') })).max(VALIDATION.CODE_MAX_LENGTH).optional(),
    vehicleId: z.string().min(1, t('validation.required', { field: t('trips.vehicle') })).optional(),
    driverId: z.string().min(1, t('validation.required', { field: t('trips.driver') })).optional(),
    fromLocation: z.string().trim().min(1, t('validation.required', { field: t('trips.from_location') })).max(VALIDATION.LOCATION_MAX_LENGTH).optional(),
    toLocation: z.string().trim().min(1, t('validation.required', { field: t('trips.to_location') })).max(VALIDATION.LOCATION_MAX_LENGTH).optional(),
    status: tripStatusSchema.optional(),
    cargoDescription: optionalTrimmedText,
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    actualEndDate: z.string().optional(),
    notes: optionalTrimmedText,
  }).refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    { message: t('validation.end_date_after_start'), path: ['endDate'] }
  ).refine(
    (data) => {
      if (!data.startDate || !data.actualEndDate) return true;
      return data.actualEndDate >= data.startDate;
    },
    { message: t('validation.end_date_after_start'), path: ['actualEndDate'] }
  );
}

export type CreateTripFormValues = z.input<ReturnType<typeof createTripSchema>>;
export type CreateTripSubmitValues = z.output<ReturnType<typeof createTripSchema>>;

export type UpdateTripFormValues = z.input<ReturnType<typeof createUpdateTripSchema>>;
export type UpdateTripSubmitValues = z.output<ReturnType<typeof createUpdateTripSchema>>;
