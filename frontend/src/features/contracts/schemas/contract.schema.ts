import { z } from 'zod';
import { CONTRACT_STATUS, VALIDATION } from '@tms/shared';

export const contractStatusSchema = z.nativeEnum(CONTRACT_STATUS);

export const contractTypeSchema = z.enum(['PER_TRIP', 'MONTHLY']);

export function createContractSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    contractNumber: z.string().trim().min(1, t('validation.required', { field: t('contracts.contract_number') })).max(VALIDATION.CODE_MAX_LENGTH),
    clientId: z.string().min(1, t('validation.required', { field: t('clients.title') })),
    title: z.string().trim().min(1, t('validation.required', { field: t('contracts.title_field') })).max(VALIDATION.NAME_MAX_LENGTH),
    description: z.string().trim().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional().transform((v) => v || undefined),
    fromLocation: z.string().trim().max(VALIDATION.LOCATION_MAX_LENGTH).optional().transform((v) => v || undefined),
    toLocation: z.string().trim().max(VALIDATION.LOCATION_MAX_LENGTH).optional().transform((v) => v || undefined),
    price: z.coerce.number().positive(t('validation.price_must_be_positive')).optional(),
    currency: z.string().trim().max(VALIDATION.CURRENCY_MAX_LENGTH).default('EGP'),
    contractType: contractTypeSchema.default('PER_TRIP'),
    assignedVehicleId: z.string().optional(),
    assignedDriverId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: contractStatusSchema.default('DRAFT'),
    notes: z.string().trim().optional().transform((v) => v || undefined),
  }).refine(
    (data) => {
      if (data.status !== 'ACTIVE') return true;
      if (data.price == null || data.price <= 0) return false;
      if (!data.startDate || !data.endDate) return false;
      if (data.startDate >= data.endDate) return false;
      return true;
    },
    { message: t('validation.contract_active_requirements'), path: ['price'] }
  );
}

export function createUpdateContractSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    contractNumber: z.string().trim().min(1, t('validation.required', { field: t('contracts.contract_number') })).max(VALIDATION.CODE_MAX_LENGTH).optional(),
    clientId: z.string().min(1, t('validation.required', { field: t('clients.title') })).optional(),
    title: z.string().trim().min(1, t('validation.required', { field: t('contracts.title_field') })).max(VALIDATION.NAME_MAX_LENGTH).optional(),
    description: z.string().trim().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional().transform((v) => v || undefined),
    fromLocation: z.string().trim().max(VALIDATION.LOCATION_MAX_LENGTH).optional().transform((v) => v || undefined),
    toLocation: z.string().trim().max(VALIDATION.LOCATION_MAX_LENGTH).optional().transform((v) => v || undefined),
    price: z.coerce.number().positive(t('validation.price_must_be_positive')).optional(),
    currency: z.string().trim().max(VALIDATION.CURRENCY_MAX_LENGTH).optional(),
    contractType: contractTypeSchema.optional(),
    assignedVehicleId: z.string().optional(),
    assignedDriverId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: contractStatusSchema.optional(),
    notes: z.string().trim().optional().transform((v) => v || undefined),
  }).refine(
    (data) => {
      if (data.status !== 'ACTIVE') return true;
      if (data.price != null && data.price <= 0) return false;
      if (data.startDate && data.endDate && data.startDate >= data.endDate) return false;
      return true;
    },
    { message: t('validation.contract_active_requirements'), path: ['status'] }
  );
}

export type CreateContractFormValues = z.input<ReturnType<typeof createContractSchema>>;
export type CreateContractSubmitValues = z.output<ReturnType<typeof createContractSchema>>;

export type UpdateContractFormValues = z.input<ReturnType<typeof createUpdateContractSchema>>;
export type UpdateContractSubmitValues = z.output<ReturnType<typeof createUpdateContractSchema>>;
