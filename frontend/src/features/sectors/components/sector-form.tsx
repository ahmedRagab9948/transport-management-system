'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSection } from '@/components/shared';
import { useT } from '@/lib/i18n';
import type { CreateSectorPayload, UpdateSectorPayload, Sector } from '../types/sector.types';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(20),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(20),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof createSchema>;

interface SectorFormProps {
  sector?: Sector;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: CreateSectorPayload | UpdateSectorPayload) => void;
  onCancel: () => void;
}

export function SectorForm({ sector, isSubmitting, errorMessage, onSubmit: onSubmitProp, onCancel }: SectorFormProps) {
  const { t } = useT();
  const isEdit = !!sector;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: {
      name: sector?.name ?? '',
      code: sector?.code ?? '',
      description: sector?.description ?? '',
    },
  });

  function onFormSubmit(data: FormValues) {
    onSubmitProp(data);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <FormSection title={t('sectors.sector_information')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('sectors.sector_name')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              placeholder={t('sectors.name_placeholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              {t('sectors.sector_code')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="code"
              placeholder={t('sectors.code_placeholder')}
              {...register('code')}
              aria-invalid={!!errors.code}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            {t('sectors.description')}
          </label>
          <Textarea
            id="description"
            placeholder={t('sectors.description_placeholder')}
            rows={3}
            {...register('description')}
          />
        </div>

        {!isEdit && (
          <p className="text-xs text-muted-foreground">{t('sectors.default_sub_sector_hint')}</p>
        )}
      </FormSection>

      {errorMessage && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {t(isEdit ? 'sectors.update_sector' : 'sectors.create_sector')}
        </Button>
      </div>
    </form>
  );
}
