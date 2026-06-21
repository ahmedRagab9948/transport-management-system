'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, FileText, MapPin, Save, Truck } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { FormSection, GlassCard, SectionHeader, BaseStatCard } from '@/components/shared';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { useT } from '@/lib/i18n';
import { useFormAutoFocus } from '@/lib/forms';
import { useTripDrivers, useTripVehicles, useTripClients } from '../hooks/use-trips';
import { useClientContracts } from '@/features/contracts/hooks/use-contracts';
import type { CreateTripPayload } from '../types/trip.types';
import type { Contract } from '@/features/contracts/types/contract.types';
import {
  createTripSchema,
  type CreateTripFormValues,
  type CreateTripSubmitValues,
} from '../schemas/trip.schema';

interface CreateTripFormProps {
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: CreateTripPayload) => void;
  onCancel: () => void;
}

export function CreateTripForm({
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: CreateTripFormProps) {
  const { t } = useT();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useTripVehicles();
  const { data: drivers = [], isLoading: driversLoading } = useTripDrivers();
  const { data: clients = [], isLoading: clientsLoading } = useTripClients();

  const schema = createTripSchema(t);
  const form = useForm<CreateTripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tripNumber: `TRIP-${Date.now()}`,
      clientId: '',
      contractId: '',
      vehicleId: '',
      driverId: '',
      fromLocation: '',
      toLocation: '',
      status: 'PENDING',
      cargoDescription: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
  });
  useFormAutoFocus(form);

  useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;
  const { scrollToError } = useScrollToError<CreateTripFormValues>();

  const selectedClientId = useWatch({ control: form.control, name: 'clientId' });
  const selectedContractId = useWatch({ control: form.control, name: 'contractId' });

  const { data: contracts = [], isLoading: contractsLoading } = useClientContracts(selectedClientId);

  const selectedContract = useMemo<Contract | undefined>(
    () => contracts.find((c) => c.id === selectedContractId),
    [contracts, selectedContractId],
  );

  const isMonthlyContract = selectedContract?.contractType === 'MONTHLY';

  useEffect(() => {
    form.setValue('contractId', '');
    form.setValue('vehicleId', '');
    form.setValue('driverId', '');
  }, [selectedClientId, form]);

  useEffect(() => {
    if (selectedContract) {
      if (selectedContract.contractType === 'MONTHLY') {
        form.setValue('vehicleId', selectedContract.assignedVehicleId ?? '');
        form.setValue('driverId', selectedContract.assignedDriverId ?? '');
      }
    }
  }, [selectedContract, form]);

  const handleFormSubmit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as CreateTripSubmitValues;
      onSubmit({
        tripNumber: parsed.tripNumber,
        clientId: parsed.clientId,
        contractId: parsed.contractId,
        vehicleId: parsed.vehicleId,
        driverId: parsed.driverId,
        fromLocation: parsed.fromLocation,
        toLocation: parsed.toLocation,
        status: parsed.status,
        cargoDescription: parsed.cargoDescription,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        notes: parsed.notes,
      });
    },
    () => {
      setTimeout(() => scrollToError(form.formState.errors), 100);
    },
  );

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FormSection title={t('trips.contract')} icon={FileText}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.clientId}>
            <FieldLabel htmlFor="clientId" required>{t('clients.title')}</FieldLabel>
            <Controller
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <Combobox
                  options={clients.map((c) => ({ value: c.id, label: c.companyName }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('trips.select_client')}
                  searchPlaceholder={t('common.search') + '...'}
                  emptyText={t('common.no_results')}
                  disabled={isSubmitting || clientsLoading}
                  loading={clientsLoading}
                  error={!!errors.clientId}
                />
              )}
            />
            <FieldError errors={[errors.clientId]} />
          </Field>

          <Field data-invalid={!!errors.contractId}>
            <FieldLabel htmlFor="contractId" required>{t('trips.contract')}</FieldLabel>
            <Controller
              control={form.control}
              name="contractId"
              render={({ field }) => (
                <Combobox
                  options={contracts.map((c) => ({
                    value: c.id,
                    label: `${c.contractNumber} — ${c.contractType === 'MONTHLY' ? t('contracts.contract_type_monthly') : t('contracts.contract_type_per_trip')}`,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('trips.select_contract')}
                  searchPlaceholder={t('common.search') + '...'}
                  emptyText={t('common.no_results')}
                  disabled={isSubmitting || !selectedClientId || contractsLoading}
                  loading={contractsLoading}
                  error={!!errors.contractId}
                />
              )}
            />
            <FieldError errors={[errors.contractId]} />
          </Field>
        </FieldGroup>

        {selectedContract ? (
          <GlassCard className="mt-4">
            <SectionHeader title={t('trips.contract_summary')} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <BaseStatCard
                label={t('trips.contract_number')}
                value={selectedContract.contractNumber}
                variant="card"
              />
              <BaseStatCard
                label={t('trips.contract_type')}
                value={selectedContract.contractType === 'MONTHLY' ? t('contracts.contract_type_monthly') : t('contracts.contract_type_per_trip')}
                variant="card"
              />
              <BaseStatCard
                label={t('contracts.assigned_vehicle')}
                value={selectedContract.assignedVehicle?.vehicleCode ?? t('common.not_available')}
                variant="card"
              />
              <BaseStatCard
                label={t('contracts.assigned_driver')}
                value={selectedContract.assignedDriver?.fullName ?? t('common.not_available')}
                variant="card"
              />
            </div>
          </GlassCard>
        ) : null}
      </FormSection>

      <FormSection title={t('trips.trip_information')} icon={Truck}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" {...form.register('status')} />
          <input type="hidden" {...form.register('tripNumber')} />

          <Field data-invalid={!!errors.vehicleId}>
            <FieldLabel htmlFor="vehicleId" required>{t('trips.vehicle')}</FieldLabel>
            <Controller
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <Combobox
                  options={vehicles.map(v => ({ value: v.id, label: v.vehicleCode }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('trips.select_vehicle')}
                  searchPlaceholder={t('common.search') + '...'}
                  emptyText={t('common.no_results')}
                  disabled={isSubmitting || vehiclesLoading || isMonthlyContract}
                  loading={vehiclesLoading}
                  error={!!errors.vehicleId}
                />
              )}
            />
            <FieldError errors={[errors.vehicleId]} />
          </Field>

          <Field data-invalid={!!errors.driverId}>
            <FieldLabel htmlFor="driverId" required>{t('trips.driver')}</FieldLabel>
            <Controller
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <Combobox
                  options={drivers.map(d => ({ value: d.id, label: d.fullName }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('trips.select_driver')}
                  searchPlaceholder={t('common.search') + '...'}
                  emptyText={t('common.no_results')}
                  disabled={isSubmitting || driversLoading || isMonthlyContract}
                  loading={driversLoading}
                  error={!!errors.driverId}
                />
              )}
            />
            <FieldError errors={[errors.driverId]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('trips.route_details')} icon={MapPin}>
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.fromLocation}>
            <FieldLabel htmlFor="fromLocation" required>{t('trips.from_location')}</FieldLabel>
            <Input
              id="fromLocation"
              placeholder={t('trips.location_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.fromLocation}
              {...form.register('fromLocation')}
            />
            <FieldError errors={[errors.fromLocation]} />
          </Field>

          <Field data-invalid={!!errors.toLocation}>
            <FieldLabel htmlFor="toLocation" required>{t('trips.to_location')}</FieldLabel>
            <Input
              id="toLocation"
              placeholder={t('trips.location_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.toLocation}
              {...form.register('toLocation')}
            />
            <FieldError errors={[errors.toLocation]} />
          </Field>

          <Field data-invalid={!!errors.startDate}>
            <FieldLabel htmlFor="startDate">{t('trips.start_date')}</FieldLabel>
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
            <FieldLabel htmlFor="endDate">{t('trips.end_date')}</FieldLabel>
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

        <Field data-invalid={!!errors.cargoDescription} className="mt-4">
          <FieldLabel htmlFor="cargoDescription">{t('trips.cargo_description')}</FieldLabel>
          <Textarea
            id="cargoDescription"
            rows={3}
            disabled={isSubmitting}
            placeholder={t('trips.cargo_description')}
            aria-invalid={!!errors.cargoDescription}
            {...form.register('cargoDescription')}
          />
          <FieldError errors={[errors.cargoDescription]} />
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {!isSubmitting ? <Save className="size-4" /> : null}
          {t('trips.create_trip')}
        </Button>
      </div>
    </motion.form>
  );
}
