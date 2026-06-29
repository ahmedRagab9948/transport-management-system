'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, FileText, Landmark, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { useFormAutoFocus } from '@/lib/forms';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { FormSection } from '@/components/shared';
import { CONTRACT_STATUS, MAX_PAGE_SIZE } from '@tms/shared';
import { useContractClients } from '../hooks/use-contracts';
import { useVehicles } from '../../vehicles/hooks/use-vehicles';
import { useDrivers } from '../../drivers/hooks/use-drivers';
import type { Contract, UpdateContractPayload } from '../types/contract.types';
import {
  createUpdateContractSchema,
  type UpdateContractFormValues,
  type UpdateContractSubmitValues,
} from '../schemas/contract.schema';

interface UpdateContractFormProps {
  contract: Contract;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: UpdateContractPayload) => void;
  onCancel: () => void;
}

export function UpdateContractForm({
  contract,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UpdateContractFormProps) {
  const { t } = useT();
  const { data: clients = [], isLoading: clientsLoading } = useContractClients();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({ page: 1, limit: MAX_PAGE_SIZE });
  const { data: driversData, isLoading: driversLoading } = useDrivers({ page: 1, limit: MAX_PAGE_SIZE });

  const vehicles = vehiclesData?.items ?? [];
  const drivers = driversData?.items ?? [];

  const schema = createUpdateContractSchema(t);
  const form = useForm<UpdateContractFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractNumber: contract.contractNumber,
      clientId: contract.clientId,
      title: contract.title,
      description: contract.description ?? '',
      fromLocation: contract.fromLocation ?? '',
      toLocation: contract.toLocation ?? '',
      price: contract.price ? Number(contract.price) : undefined,
      currency: contract.currency,
      contractType: contract.contractType ?? 'PER_TRIP',
      assignedVehicleId: contract.assignedVehicleId ?? undefined,
      assignedDriverId: contract.assignedDriverId ?? undefined,
      startDate: contract.startDate?.split('T')[0] ?? '',
      endDate: contract.endDate?.split('T')[0] ?? '',
      status: contract.status,
      notes: contract.notes ?? '',
    },
  });

  const selectedContractType = form.watch('contractType');

  useEffect(() => {
    if (selectedContractType !== 'MONTHLY') {
      form.setValue('assignedVehicleId', undefined);
      form.setValue('assignedDriverId', undefined);
    }
  }, [selectedContractType, form]);
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<UpdateContractFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as UpdateContractSubmitValues;
      const payload: UpdateContractPayload = {};

      if (parsed.contractNumber !== contract.contractNumber) payload.contractNumber = parsed.contractNumber;
      if (parsed.clientId !== contract.clientId) payload.clientId = parsed.clientId;
      if (parsed.title !== contract.title) payload.title = parsed.title;
      if (parsed.description !== (contract.description ?? '')) payload.description = parsed.description || undefined;
      if (parsed.fromLocation !== (contract.fromLocation ?? '')) payload.fromLocation = parsed.fromLocation || undefined;
      if (parsed.toLocation !== (contract.toLocation ?? '')) payload.toLocation = parsed.toLocation || undefined;
      if (parsed.price !== (contract.price ? Number(contract.price) : undefined)) payload.price = parsed.price;
      if (parsed.currency !== contract.currency) payload.currency = parsed.currency;
      if (parsed.contractType !== contract.contractType) payload.contractType = parsed.contractType;
      if (parsed.assignedVehicleId !== (contract.assignedVehicleId ?? undefined)) payload.assignedVehicleId = parsed.assignedVehicleId || undefined;
      if (parsed.assignedDriverId !== (contract.assignedDriverId ?? undefined)) payload.assignedDriverId = parsed.assignedDriverId || undefined;
      if (parsed.startDate !== (contract.startDate?.split('T')[0] ?? '')) payload.startDate = parsed.startDate || undefined;
      if (parsed.endDate !== (contract.endDate?.split('T')[0] ?? '')) payload.endDate = parsed.endDate || undefined;
      if (parsed.status !== contract.status) payload.status = parsed.status;
      if (parsed.notes !== (contract.notes ?? '')) payload.notes = parsed.notes || undefined;

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
      <FormSection title={t('contracts.contract_information')} icon={FileText}>
        <input type="hidden" {...form.register('contractNumber')} />
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.clientId}>
            <FieldLabel htmlFor="clientId" required>{t('clients.title')}</FieldLabel>
            <select
              id="clientId"
              disabled={isSubmitting || clientsLoading}
              aria-invalid={!!errors.clientId}
              {...form.register('clientId')}
            >
              <option value="">{t('contracts.select_client')}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.clientId]} />
          </Field>

          <Field data-invalid={!!errors.contractType}>
            <FieldLabel htmlFor="contractType" required>{t('contracts.contract_type')}</FieldLabel>
            <Controller
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <Combobox
                  options={[
                    { value: 'PER_TRIP', label: t('contracts.contract_type_per_trip') },
                    { value: 'MONTHLY', label: t('contracts.contract_type_monthly') },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('contracts.contract_type')}
                  disabled={isSubmitting}
                  error={!!errors.contractType}
                />
              )}
            />
            <FieldError errors={[errors.contractType]} />
          </Field>

          {selectedContractType === 'MONTHLY' ? (
            <>
              <Field data-invalid={!!errors.assignedVehicleId}>
                <FieldLabel htmlFor="assignedVehicleId" required>{t('contracts.assigned_vehicle')}</FieldLabel>
                <Controller
                  control={form.control}
                  name="assignedVehicleId"
                  render={({ field }) => (
                    <Combobox
                      options={vehicles.map(v => ({ value: v.id, label: v.vehicleCode }))}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder={t('trips.select_vehicle')}
                      searchPlaceholder={t('common.search') + '...'}
                      emptyText={t('common.no_results')}
                      disabled={isSubmitting || vehiclesLoading}
                      loading={vehiclesLoading}
                      error={!!errors.assignedVehicleId}
                    />
                  )}
                />
                <FieldError errors={[errors.assignedVehicleId]} />
              </Field>

              <Field data-invalid={!!errors.assignedDriverId}>
                <FieldLabel htmlFor="assignedDriverId" required>{t('contracts.assigned_driver')}</FieldLabel>
                <Controller
                  control={form.control}
                  name="assignedDriverId"
                  render={({ field }) => (
                    <Combobox
                      options={drivers.map(d => ({ value: d.id, label: d.fullName }))}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder={t('trips.select_driver')}
                      searchPlaceholder={t('common.search') + '...'}
                      emptyText={t('common.no_results')}
                      disabled={isSubmitting || driversLoading}
                      loading={driversLoading}
                      error={!!errors.assignedDriverId}
                    />
                  )}
                />
                <FieldError errors={[errors.assignedDriverId]} />
              </Field>
            </>
          ) : null}

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status" required>{t('common.status')}</FieldLabel>
            <select
              id="status"
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
              {...form.register('status')}
            >
              {Object.values(CONTRACT_STATUS).map((value) => (
                <option key={value} value={value}>
                  {t(`common_statuses.${value.toLowerCase()}`)}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.status]} />
          </Field>

          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title" required>{t('contracts.title_field')}</FieldLabel>
            <Input
              id="title"
              placeholder={t('contracts.title_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              {...form.register('title')}
            />
            <FieldError errors={[errors.title]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('contracts.route_and_pricing')} icon={Landmark}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">

        <Field data-invalid={!!errors.fromLocation}>
          <FieldLabel htmlFor="fromLocation">{t('contracts.from_location')}</FieldLabel>
          <Input
            id="fromLocation"
            placeholder={t('contracts.from_location_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!errors.fromLocation}
            {...form.register('fromLocation')}
          />
          <FieldError errors={[errors.fromLocation]} />
        </Field>

        <Field data-invalid={!!errors.toLocation}>
          <FieldLabel htmlFor="toLocation">{t('contracts.to_location')}</FieldLabel>
          <Input
            id="toLocation"
            placeholder={t('contracts.to_location_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!errors.toLocation}
            {...form.register('toLocation')}
          />
          <FieldError errors={[errors.toLocation]} />
        </Field>

        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="price">{t('contracts.price')}</FieldLabel>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder={t('contracts.price_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!errors.price}
            {...form.register('price')}
          />
          <FieldError errors={[errors.price]} />
        </Field>

        <Field data-invalid={!!errors.currency}>
          <FieldLabel htmlFor="currency" required>{t('contracts.currency')}</FieldLabel>
          <Input
            id="currency"
            placeholder={t('contracts.currency_placeholder')}
            maxLength={10}
            disabled={isSubmitting}
            aria-invalid={!!errors.currency}
            {...form.register('currency')}
          />
          <FieldError errors={[errors.currency]} />
        </Field>

        <Field data-invalid={!!errors.startDate}>
          <FieldLabel htmlFor="startDate">{t('contracts.start_date')}</FieldLabel>
          <Input
            id="startDate"
            type="date"
            disabled={isSubmitting}
            aria-invalid={!!errors.startDate}
            {...form.register('startDate')}
          />
          <FieldError errors={[errors.startDate]} />
        </Field>

        <Field data-invalid={!!errors.endDate}>
          <FieldLabel htmlFor="endDate">{t('contracts.end_date')}</FieldLabel>
          <Input
            id="endDate"
            type="date"
            disabled={isSubmitting}
            aria-invalid={!!errors.endDate}
            {...form.register('endDate')}
          />
          <FieldError errors={[errors.endDate]} />
        </Field>
      </FieldGroup>

        <Field data-invalid={!!errors.description} className="mt-4">
          <FieldLabel htmlFor="description">{t('contracts.description')}</FieldLabel>
          <Textarea
            id="description"
            rows={3}
            disabled={isSubmitting}
            placeholder={t('contracts.description')}
            aria-invalid={!!errors.description}
            {...form.register('description')}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field data-invalid={!!errors.notes} className="mt-4">
          <FieldLabel htmlFor="notes">{t('common.notes')}</FieldLabel>
          <Textarea
            id="notes"
            rows={3}
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
