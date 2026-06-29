import { z } from 'zod';
import { VALIDATION } from '@tms/shared';

export function createSectorSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    name: z.string().min(1, t('validation.required', { field: t('sectors.sector_name') })),
    code: z.string().min(1, t('validation.required', { field: t('sectors.sector_code') })).max(VALIDATION.SECTOR_CODE_MAX_LENGTH),
    description: z.string().optional(),
  });
}

export function createUpdateSectorSchema(t: (key: string, params?: Record<string, string | number>) => string) {
  return z.object({
    name: z.string().min(1, t('validation.required', { field: t('sectors.sector_name') })),
    code: z.string().min(1, t('validation.required', { field: t('sectors.sector_code') })).max(VALIDATION.SECTOR_CODE_MAX_LENGTH),
    description: z.string().optional(),
  });
}

export type SectorFormValues = z.infer<ReturnType<typeof createSectorSchema>>;
