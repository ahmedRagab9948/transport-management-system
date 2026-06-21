'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Building2, FileText, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { useFormAutoFocus } from '@/lib/forms';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { FormSection } from '@/components/shared';
import type { Client, UpdateClientPayload } from '../types/client.types';
import {
  createUpdateClientSchema,
  type UpdateClientFormValues,
  type UpdateClientSubmitValues,
} from '../schemas/client.schema';

interface UpdateClientFormProps {
  client: Client;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: UpdateClientPayload) => void;
  onCancel: () => void;
}

export function UpdateClientForm({
  client,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UpdateClientFormProps) {
  const { t } = useT();
  const schema = createUpdateClientSchema(t);
  const form = useForm<UpdateClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      taxNumber: client.taxNumber ?? '',
      notes: client.notes ?? '',
      status: client.status,
    },
  });
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<UpdateClientFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as UpdateClientSubmitValues;
      const payload: UpdateClientPayload = {};

      if (parsed.companyName !== client.companyName) payload.companyName = parsed.companyName;
      if (parsed.contactPerson !== client.contactPerson) payload.contactPerson = parsed.contactPerson;
      if (parsed.email !== (client.email ?? '')) payload.email = parsed.email || undefined;
      if (parsed.phone !== (client.phone ?? '')) payload.phone = parsed.phone || undefined;
      if (parsed.address !== (client.address ?? '')) payload.address = parsed.address || undefined;
      if (parsed.taxNumber !== (client.taxNumber ?? '')) payload.taxNumber = parsed.taxNumber || undefined;
      if (parsed.status !== client.status) payload.status = parsed.status;
      if (parsed.notes !== (client.notes ?? '')) payload.notes = parsed.notes || undefined;

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
      <FormSection title={t('clients.company_information')} icon={Building2}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.companyName}>
            <FieldLabel htmlFor="companyName" required>{t('clients.company_name')}</FieldLabel>
            <Input
              id="companyName"
              placeholder={t('clients.company_name_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.companyName}
              {...form.register('companyName')}
            />
            <FieldError errors={[errors.companyName]} />
          </Field>

          <Field data-invalid={!!errors.contactPerson}>
            <FieldLabel htmlFor="contactPerson" required>{t('clients.contact_person')}</FieldLabel>
            <Input
              id="contactPerson"
              placeholder={t('clients.contact_person_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.contactPerson}
              {...form.register('contactPerson')}
            />
            <FieldError errors={[errors.contactPerson]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{t('common.email')}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t('clients.email_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              {...form.register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">{t('common.phone')}</FieldLabel>
            <Input
              id="phone"
              placeholder={t('clients.phone_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.phone}
              {...form.register('phone')}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('clients.tax_and_status')} icon={FileText}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.taxNumber}>
            <FieldLabel htmlFor="taxNumber">{t('clients.tax_number')}</FieldLabel>
            <Input
              id="taxNumber"
              placeholder={t('clients.tax_number_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.taxNumber}
              {...form.register('taxNumber')}
            />
            <FieldError errors={[errors.taxNumber]} />
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status" required>{t('common.status')}</FieldLabel>
            <select
              id="status"
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
              {...form.register('status')}
            >
              <option value="ACTIVE">{t('common_statuses.active')}</option>
              <option value="INACTIVE">{t('common_statuses.inactive')}</option>
            </select>
            <FieldError errors={[errors.status]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('common.additional_information')}>
        <Field data-invalid={!!errors.address} className="mb-4">
          <FieldLabel htmlFor="address">{t('common.address')}</FieldLabel>
          <Textarea
            id="address"
            rows={2}
            disabled={isSubmitting}
            placeholder={t('clients.address_placeholder')}
            aria-invalid={!!errors.address}
            {...form.register('address')}
          />
          <FieldError errors={[errors.address]} />
        </Field>

        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">{t('common.notes')}</FieldLabel>
          <Textarea
            id="notes"
            rows={3}
            disabled={isSubmitting}
            placeholder={t('clients.notes_placeholder')}
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
