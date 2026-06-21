import { z } from 'zod';

export const vehicleTypeSchema = z.enum(['TRAILER', 'JUMBO']);
export const vehicleStatusSchema = z.enum([
  'ACTIVE',
  'IN_TRIP',
  'IN_MAINTENANCE',
  'OUT_OF_SERVICE',
]);
export const vehiclePlateRoleSchema = z.enum(['TRUCK_HEAD', 'TRAILER_UNIT', 'JUMBO']);

const optionalTrimmedText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export function createVehicleSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z
    .object({
      vehicleCode: z.string().trim().min(1, t('validation.required', { field: t('vehicles.vehicle_code') })).max(100),
      type: vehicleTypeSchema,
      status: vehicleStatusSchema.default('ACTIVE'),
      manufacturer: optionalTrimmedText,
      model: optionalTrimmedText,
      productionYear: z.coerce
        .number()
        .int()
        .min(1900)
        .max(2100)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      capacityKg: z.coerce
        .number()
        .int()
        .min(0)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      notes: optionalTrimmedText,
      plates: z.array(
        z.object({
          role: vehiclePlateRoleSchema,
          plateNumber: z.string().trim().min(1, t('validation.required', { field: t('vehicles.plate_number') })).max(50),
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
      vehicleCode: z.string().trim().min(1, t('validation.required', { field: t('vehicles.vehicle_code') })).max(100).optional(),
      type: vehicleTypeSchema.optional(),
      status: vehicleStatusSchema.optional(),
      manufacturer: optionalTrimmedText,
      model: optionalTrimmedText,
      productionYear: z.coerce
        .number()
        .int()
        .min(1900)
        .max(2100)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      capacityKg: z.coerce
        .number()
        .int()
        .min(0)
        .optional()
        .or(z.literal('').transform(() => undefined)),
      notes: optionalTrimmedText,
      plates: z
        .array(
          z.object({
            role: vehiclePlateRoleSchema,
            plateNumber: z.string().trim().min(1, t('validation.required', { field: t('vehicles.plate_number') })).max(50),
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
