'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, IdCard, Save, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DRIVER_STATUS } from '@tms/shared';
import { useT } from '@/lib/i18n';
import { useFormAutoFocus } from '@/lib/forms';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { FormSection } from '@/components/shared';
import type { Driver, UpdateDriverPayload } from '../types/driver.types';
import {
  createUpdateDriverSchema,
  type UpdateDriverFormValues,
  type UpdateDriverSubmitValues,
} from '../schemas/driver.schema';

interface UpdateDriverFormProps {
  driver: Driver;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: UpdateDriverPayload) => void;
  onCancel: () => void;
}

export function UpdateDriverForm({
  driver,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UpdateDriverFormProps) {
  const { t } = useT();
  const schema = createUpdateDriverSchema(t);
  const form = useForm<UpdateDriverFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: driver.fullName,
      phone: driver.phone,
      nationalId: driver.nationalId,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry.split('T')[0],
      status: driver.status,
      notes: driver.notes ?? '',
    },
  });
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<UpdateDriverFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as UpdateDriverSubmitValues;
      const payload: UpdateDriverPayload = {};

      if (parsed.fullName !== driver.fullName) payload.fullName = parsed.fullName;
      if (parsed.phone !== driver.phone) payload.phone = parsed.phone;
      if (parsed.nationalId !== driver.nationalId) payload.nationalId = parsed.nationalId;
      if (parsed.licenseNumber !== driver.licenseNumber) payload.licenseNumber = parsed.licenseNumber;
      if (parsed.licenseExpiry !== driver.licenseExpiry.split('T')[0])
        payload.licenseExpiry = parsed.licenseExpiry;
      if (parsed.status !== driver.status) payload.status = parsed.status;
      if (parsed.notes !== (driver.notes ?? '')) payload.notes = parsed.notes || '';

      onSubmit(payload);
    },
    () => {
      setTimeout(() => scrollToError(form.formState.errors), 100);
    },
  );

  return (
    <motion.form
      onSubmit={submit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FormSection title={t('drivers.personal_information')} icon={User}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.fullName}>
            <FieldLabel htmlFor="fullName" required>{t('drivers.full_name')}</FieldLabel>
            <Input
              id="fullName"
              placeholder={t('drivers.full_name_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.fullName}
              {...form.register('fullName')}
            />
            <FieldError errors={[errors.fullName]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" required>{t('common.phone')}</FieldLabel>
            <Input
              id="phone"
              placeholder={t('drivers.phone_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.phone}
              {...form.register('phone')}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('drivers.license_information')} icon={IdCard}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.nationalId}>
            <FieldLabel htmlFor="nationalId" required>{t('drivers.national_id')}</FieldLabel>
            <Input
              id="nationalId"
              placeholder={t('drivers.national_id_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.nationalId}
              {...form.register('nationalId')}
            />
            <FieldError errors={[errors.nationalId]} />
          </Field>

          <Field data-invalid={!!errors.licenseNumber}>
            <FieldLabel htmlFor="licenseNumber" required>{t('drivers.license_number')}</FieldLabel>
            <Input
              id="licenseNumber"
              placeholder={t('drivers.license_number_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.licenseNumber}
              {...form.register('licenseNumber')}
            />
            <FieldError errors={[errors.licenseNumber]} />
          </Field>

          <Field data-invalid={!!errors.licenseExpiry}>
            <FieldLabel htmlFor="licenseExpiry" required>{t('drivers.license_expiry')}</FieldLabel>
            <Input
              id="licenseExpiry"
              type="date"
              disabled={isSubmitting}
              aria-invalid={!!errors.licenseExpiry}
              {...form.register('licenseExpiry')}
            />
            <FieldError errors={[errors.licenseExpiry]} />
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status" required>{t('common.status')}</FieldLabel>
            <select
              id="status"
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
              {...form.register('status')}
            >
              {Object.values(DRIVER_STATUS).filter((s) => s !== 'IN_TRIP').map((value) => (
                <option key={value} value={value}>
                  {t(`common_statuses.${value.toLowerCase()}`)}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.status]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('common.additional_information')}>
        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">{t('common.notes')}</FieldLabel>
          <Textarea
            id="notes"
            rows={4}
            disabled={isSubmitting}
            placeholder={t('common.notes')}
            aria-invalid={!!errors.notes}
            {...form.register('notes')}
          />
          <FieldError errors={[errors.notes]} />
        </Field>
      </FormSection>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => { if (confirmNavigation()) onCancel(); }} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {!isSubmitting ? <Save className="size-4" /> : null}
          {t('common.save')}
        </Button>
      </div>
    </motion.form>
  );
}
