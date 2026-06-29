'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormAutoFocus } from '@/lib/forms';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { FormSection } from '@/components/shared';
import { useT } from '@/lib/i18n';
import { createSectorSchema, createUpdateSectorSchema, type SectorFormValues } from '../schemas/sector.schema';
import type { CreateSectorPayload, UpdateSectorPayload, Sector } from '../types/sector.types';

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

  const schema = isEdit ? createUpdateSectorSchema(t) : createSectorSchema(t);
  const form = useForm<SectorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: sector?.name ?? '',
      code: sector?.code ?? '',
      description: sector?.description ?? '',
    },
  });
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<SectorFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;

  function onFormSubmit(data: SectorFormValues) {
    onSubmitProp(data);
  }

  const submit = form.handleSubmit(
    onFormSubmit,
    () => {
      setTimeout(() => scrollToError(form.formState.errors), 100);
    },
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection title={t('sectors.sector_information')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name" required>{t('sectors.sector_name')}</FieldLabel>
            <Input
              id="name"
              placeholder={t('sectors.name_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              {...form.register('name')}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.code}>
            <FieldLabel htmlFor="code" required>{t('sectors.sector_code')}</FieldLabel>
            <Input
              id="code"
              placeholder={t('sectors.code_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.code}
              {...form.register('code')}
            />
            <FieldError errors={[errors.code]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">{t('sectors.description')}</FieldLabel>
          <Textarea
            id="description"
            placeholder={t('sectors.description_placeholder')}
            rows={3}
            disabled={isSubmitting}
            {...form.register('description')}
          />
        </Field>

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
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => { if (confirmNavigation()) onCancel(); }}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {!isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {t(isEdit ? 'sectors.update_sector' : 'sectors.create_sector')}
        </Button>
      </div>
    </form>
  );
}
