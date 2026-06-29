import { z } from 'zod';
import { VEHICLE_STATUS, VALIDATION } from '@tms/shared';
import { optionalTrimmedText } from '@/lib/forms';

export const vehicleTypeSchema = z.enum(['TRAILER', 'JUMBO']);
export const vehicleStatusSchema = z.nativeEnum(VEHICLE_STATUS);
export const vehiclePlateRoleSchema = z.enum(['TRUCK_HEAD', 'TRAILER_UNIT', 'JUMBO']);

export function createVehicleSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z
    .object({
      vehicleCode: z.string().trim().min(1, t('validation.required', { field: t('vehicles.vehicle_code') })).max(VALIDATION.CODE_MAX_LENGTH),
      type: vehicleTypeSchema,
      status: vehicleStatusSchema.default('ACTIVE'),
      manufacturer: optionalTrimmedText,
      model: optionalTrimmedText,
      productionYear: z.coerce
        .number()
        .int()
        .min(VALIDATION.PRODUCTION_YEAR_MIN)
        .max(VALIDATION.PRODUCTION_YEAR_MAX)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      capacityKg: z.coerce
        .number()
        .int()
        .min(VALIDATION.CAPACITY_MIN)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      notes: optionalTrimmedText,
      plates: z.array(
        z.object({
          role: vehiclePlateRoleSchema,
            plateNumber: z.string().trim().min(1, t('validation.required', { field: t('vehicles.plate_number') })).max(VALIDATION.PLATE_MAX_LENGTH),
        }),
      ),
    })
    .superRefine((value, context) => {
      const roles = value.plates.map((plate) => plate.role);
      const plateNumbers = value.plates.map((plate) => plate.plateNumber.toUpperCase());

      if (new Set(plateNumbers).size !== plateNumbers.length) {
        context.addIssue({
          code: 'custom',
          path: ['plates'],
          message: t('validation.plate_unique'),
        });
      }

      if (value.type === 'TRAILER') {
        const valid =
          value.plates.length === 2 && roles.includes('TRUCK_HEAD') && roles.includes('TRAILER_UNIT');

        if (!valid) {
          context.addIssue({
            code: 'custom',
            path: ['plates'],
            message: t('validation.trailer_plates'),
          });
        }
      }

      if (value.type === 'JUMBO') {
        const valid = value.plates.length === 1 && roles[0] === 'JUMBO';

        if (!valid) {
          context.addIssue({
            code: 'custom',
            path: ['plates'],
            message: t('validation.jumbo_plates'),
          });
        }
      }
    });
}

export function createUpdateVehicleSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z
    .object({
      vehicleCode: z.string().trim().min(1, t('validation.required', { field: t('vehicles.vehicle_code') })).max(VALIDATION.CODE_MAX_LENGTH).optional(),
      type: vehicleTypeSchema.optional(),
      status: vehicleStatusSchema.optional(),
      manufacturer: optionalTrimmedText,
      model: optionalTrimmedText,
      productionYear: z.coerce
        .number()
        .int()
        .min(VALIDATION.PRODUCTION_YEAR_MIN)
        .max(VALIDATION.PRODUCTION_YEAR_MAX)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      capacityKg: z.coerce
        .number()
        .int()
        .min(VALIDATION.CAPACITY_MIN)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      notes: optionalTrimmedText,
      plates: z
        .array(
          z.object({
            role: vehiclePlateRoleSchema,
plateNumber: z.string().trim().min(1, t('validation.required', { field: t('vehicles.plate_number') })).max(VALIDATION.PLATE_MAX_LENGTH),
          }),
        )
        .optional(),
    })
    .superRefine((value, context) => {
      if (!value.plates || value.plates.length === 0) return;

      const roles = value.plates.map((plate) => plate.role);
      const plateNumbers = value.plates.map((plate) => plate.plateNumber.toUpperCase());

      if (new Set(plateNumbers).size !== plateNumbers.length) {
        context.addIssue({
          code: 'custom',
          path: ['plates'],
          message: t('validation.plate_unique'),
        });
      }

      if (value.type === 'TRAILER') {
        const valid =
          value.plates.length === 2 && roles.includes('TRUCK_HEAD') && roles.includes('TRAILER_UNIT');

        if (!valid) {
          context.addIssue({
            code: 'custom',
            path: ['plates'],
            message: t('validation.trailer_plates'),
          });
        }
      }

      if (value.type === 'JUMBO') {
        const valid = value.plates.length === 1 && roles[0] === 'JUMBO';

        if (!valid) {
          context.addIssue({
            code: 'custom',
            path: ['plates'],
            message: t('validation.jumbo_plates'),
          });
        }
      }
    });
}

export type CreateVehicleFormValues = z.input<ReturnType<typeof createVehicleSchema>>;
export type CreateVehicleSubmitValues = z.output<ReturnType<typeof createVehicleSchema>>;

export type UpdateVehicleFormValues = z.input<ReturnType<typeof createUpdateVehicleSchema>>;
export type UpdateVehicleSubmitValues = z.output<ReturnType<typeof createUpdateVehicleSchema>>;
