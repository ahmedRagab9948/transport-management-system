'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, MapPin, Save, Truck } from 'lucide-react';
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
import { useTripDrivers, useTripVehicles } from '../hooks/use-trips';
import type { Trip, UpdateTripPayload } from '../types/trip.types';
import {
  createUpdateTripSchema,
  type UpdateTripFormValues,
  type UpdateTripSubmitValues,
} from '../schemas/trip.schema';

interface UpdateTripFormProps {
  trip: Trip;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: UpdateTripPayload) => void;
  onCancel: () => void;
}

export function UpdateTripForm({
  trip,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UpdateTripFormProps) {
  const { t } = useT();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useTripVehicles();
  const { data: drivers = [], isLoading: driversLoading } = useTripDrivers();

  const schema = createUpdateTripSchema(t);
  const form = useForm<UpdateTripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tripNumber: trip.tripNumber,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      fromLocation: trip.fromLocation,
      toLocation: trip.toLocation,
      status: trip.status,
      cargoDescription: trip.cargoDescription ?? '',
      startDate: trip.startDate?.split('T')[0] ?? '',
      endDate: trip.endDate?.split('T')[0] ?? '',
      actualEndDate: trip.actualEndDate?.split('T')[0] ?? '',
      notes: trip.notes ?? '',
    },
  });
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<UpdateTripFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const errors = form.formState.errors;

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as UpdateTripSubmitValues;
      const payload: UpdateTripPayload = {};

      if (parsed.tripNumber !== trip.tripNumber) payload.tripNumber = parsed.tripNumber;
      if (parsed.vehicleId !== trip.vehicleId) payload.vehicleId = parsed.vehicleId;
      if (parsed.driverId !== trip.driverId) payload.driverId = parsed.driverId;
      if (parsed.fromLocation !== trip.fromLocation) payload.fromLocation = parsed.fromLocation;
      if (parsed.toLocation !== trip.toLocation) payload.toLocation = parsed.toLocation;
      if (parsed.status !== trip.status) payload.status = parsed.status;
      if (parsed.cargoDescription !== (trip.cargoDescription ?? ''))
        payload.cargoDescription = parsed.cargoDescription || undefined;
      if (parsed.startDate !== (trip.startDate?.split('T')[0] ?? ''))
        payload.startDate = parsed.startDate || undefined;
      if (parsed.endDate !== (trip.endDate?.split('T')[0] ?? ''))
        payload.endDate = parsed.endDate || undefined;
      if (parsed.actualEndDate !== (trip.actualEndDate?.split('T')[0] ?? ''))
        payload.actualEndDate = parsed.actualEndDate || undefined;
      if (parsed.notes !== (trip.notes ?? ''))
        payload.notes = parsed.notes || undefined;

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
      <FormSection title={t('trips.trip_information')} icon={Truck}>
        <input type="hidden" {...form.register('tripNumber')} />
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status" required>{t('common.status')}</FieldLabel>
            <select
              id="status"
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
              {...form.register('status')}
            >
              <option value="DRAFT">{t('common_statuses.draft')}</option>
              <option value="PENDING">{t('common_statuses.pending')}</option>
              <option value="ASSIGNED">{t('common_statuses.assigned')}</option>
              <option value="DRIVER_CONFIRMED">{t('common_statuses.driver_confirmed')}</option>
              <option value="LOADING">{t('common_statuses.loading')}</option>
              <option value="ON_ROUTE">{t('common_statuses.on_route')}</option>
              <option value="WAITING">{t('common_statuses.waiting')}</option>
              <option value="UNLOADING">{t('common_statuses.unloading')}</option>
              <option value="COMPLETED">{t('common_statuses.completed')}</option>
              <option value="CANCELLED">{t('common_statuses.cancelled')}</option>
            </select>
            <FieldError errors={[errors.status]} />
          </Field>

          <Field data-invalid={!!errors.vehicleId}>
            <FieldLabel htmlFor="vehicleId" required>{t('trips.vehicle')}</FieldLabel>
            <select
              id="vehicleId"
              disabled={isSubmitting || vehiclesLoading}
              aria-invalid={!!errors.vehicleId}
              {...form.register('vehicleId')}
            >
              <option value="">{t('trips.select_vehicle')}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleCode}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.vehicleId]} />
          </Field>

          <Field data-invalid={!!errors.driverId}>
            <FieldLabel htmlFor="driverId" required>{t('trips.driver')}</FieldLabel>
            <select
              id="driverId"
              disabled={isSubmitting || driversLoading}
              aria-invalid={!!errors.driverId}
              {...form.register('driverId')}
            >
              <option value="">{t('trips.select_driver')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
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

        <Field data-invalid={!!errors.actualEndDate}>
          <FieldLabel htmlFor="actualEndDate">{t('trips.actual_end_date')}</FieldLabel>
          <Input
            id="actualEndDate"
            type="date"
            disabled={isSubmitting}
            aria-invalid={!!errors.actualEndDate}
            {...form.register('actualEndDate')}
          />
          <FieldError errors={[errors.actualEndDate]} />
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
