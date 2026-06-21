'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Cog, Save, Truck } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import type { UpdateVehiclePayload, Vehicle, VehiclePlateRole } from '../types/vehicle.types';
import {
  createUpdateVehicleSchema,
  type UpdateVehicleFormValues,
  type UpdateVehicleSubmitValues,
} from '../schemas/vehicle.schema';

interface UpdateVehicleFormProps {
  vehicle: Vehicle;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: UpdateVehiclePayload) => void;
  onCancel: () => void;
}

const plateRoleLabels: Record<VehiclePlateRole, string> = {
  TRUCK_HEAD: 'Truck Head',
  TRAILER_UNIT: 'Trailer Unit',
  JUMBO: 'Jumbo',
};

function buildPlates(type: UpdateVehicleSubmitValues['type'], vehicle: Vehicle) {
  if (!type) return vehicle.plates.map((p) => ({ role: p.role, plateNumber: p.plateNumber }));
  const typeRoles: Record<string, VehiclePlateRole[]> = {
    TRAILER: ['TRUCK_HEAD', 'TRAILER_UNIT'],
    JUMBO: ['JUMBO'],
  };
  return typeRoles[type].map((role) => {
    const existing = vehicle.plates.find((p) => p.role === role);
    return { role, plateNumber: existing?.plateNumber ?? '' };
  });
}

export function UpdateVehicleForm({
  vehicle,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UpdateVehicleFormProps) {
  const { t } = useT();

  const schema = createUpdateVehicleSchema(t);
  const form = useForm<UpdateVehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleCode: vehicle.vehicleCode,
      type: vehicle.type,
      status: vehicle.status,
      manufacturer: vehicle.manufacturer ?? '',
      model: vehicle.model ?? '',
      productionYear: vehicle.productionYear ?? '',
      capacityKg: vehicle.capacityKg ?? '',
      notes: vehicle.notes ?? '',
      plates: vehicle.plates.map((p) => ({ role: p.role, plateNumber: p.plateNumber })),
    },
  });
  useFormAutoFocus(form);
  const { scrollToError } = useScrollToError<UpdateVehicleFormValues>();
  const { confirmNavigation } = useUnsavedChanges(form.formState.isDirty);

  const vehicleType = useWatch({ control: form.control, name: 'type' });
  const plates = useWatch({ control: form.control, name: 'plates' });

  useEffect(() => {
    if (!vehicleType) return;
    const currentRoles = (plates ?? []).map((plate) => plate.role).join('|');
    const nextPlates = buildPlates(vehicleType, vehicle);
    const nextRoles = nextPlates.map((plate) => plate.role).join('|');

    if (currentRoles !== nextRoles) {
      form.setValue('plates', nextPlates, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, plates, vehicleType, vehicle]);

  const errors = form.formState.errors;

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values) as UpdateVehicleSubmitValues;
      const payload: UpdateVehiclePayload = {};

      if (parsed.vehicleCode !== vehicle.vehicleCode) payload.vehicleCode = parsed.vehicleCode;
      if (parsed.type && parsed.type !== vehicle.type) payload.type = parsed.type;
      if (parsed.status && parsed.status !== vehicle.status) payload.status = parsed.status;
      if (parsed.manufacturer !== (vehicle.manufacturer ?? '')) payload.manufacturer = parsed.manufacturer || undefined;
      if (parsed.model !== (vehicle.model ?? '')) payload.model = parsed.model || undefined;
      if (parsed.productionYear !== (vehicle.productionYear ?? '')) payload.productionYear = parsed.productionYear || undefined;
      if (parsed.capacityKg !== (vehicle.capacityKg ?? '')) payload.capacityKg = parsed.capacityKg || undefined;
      if (parsed.notes !== (vehicle.notes ?? '')) payload.notes = parsed.notes || undefined;
      if (parsed.plates) {
        const hasChanged = parsed.plates.some(
          (p, i) => p.plateNumber !== (vehicle.plates[i]?.plateNumber ?? ''),
        );
        if (hasChanged) payload.plates = parsed.plates;
      }

      onSubmit(payload);
    },
    () => {
      setTimeout(() => scrollToError(form.formState.errors), 100);
    },
  );

  const plateError =
    typeof errors.plates?.message === 'string'
      ? errors.plates.message
      : undefined;

  return (
    <motion.form
      onSubmit={submit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FormSection title={t('vehicles.vehicle_information')} icon={Truck}>
        <input type="hidden" {...form.register('vehicleCode')} />
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
          <Field data-invalid={!!errors.type}>
            <FieldLabel htmlFor="type" required>{t('vehicles.vehicle_type')}</FieldLabel>
            <select
              id="type"
              disabled={isSubmitting}
              aria-invalid={!!errors.type}
              {...form.register('type')}
            >
              <option value="TRAILER">{t('vehicles.trailer')}</option>
              <option value="JUMBO">{t('vehicles.jumbo')}</option>
            </select>
            <FieldError errors={[errors.type]} />
          </Field>

          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="status" required>{t('vehicles.initial_status')}</FieldLabel>
            <select
              id="status"
              disabled={isSubmitting}
              aria-invalid={!!errors.status}
              {...form.register('status')}
            >
              <option value="ACTIVE">{t('common_statuses.active')}</option>
              <option value="IN_MAINTENANCE">{t('common_statuses.in_maintenance')}</option>
              <option value="OUT_OF_SERVICE">{t('common_statuses.out_of_service')}</option>
            </select>
            <FieldError errors={[errors.status]} />
          </Field>

          <Field data-invalid={!!errors.capacityKg}>
            <FieldLabel htmlFor="capacityKg" required>{t('vehicles.capacity_kg')}</FieldLabel>
            <Input
              id="capacityKg"
              type="number"
              min={0}
              placeholder={t('vehicles.capacity_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.capacityKg}
              {...form.register('capacityKg')}
            />
            <FieldError errors={[errors.capacityKg]} />
          </Field>

          <Field data-invalid={!!errors.manufacturer}>
            <FieldLabel htmlFor="manufacturer" required>{t('vehicles.manufacturer')}</FieldLabel>
            <Input
              id="manufacturer"
              placeholder={t('vehicles.manufacturer_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.manufacturer}
              {...form.register('manufacturer')}
            />
            <FieldError errors={[errors.manufacturer]} />
          </Field>

          <Field data-invalid={!!errors.model}>
            <FieldLabel htmlFor="model" required>{t('vehicles.model')}</FieldLabel>
            <Input
              id="model"
              placeholder={t('vehicles.model_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.model}
              {...form.register('model')}
            />
            <FieldError errors={[errors.model]} />
          </Field>

          <Field data-invalid={!!errors.productionYear}>
            <FieldLabel htmlFor="productionYear">{t('vehicles.production_year')}</FieldLabel>
            <Input
              id="productionYear"
              type="number"
              min={1900}
              max={2100}
              placeholder={t('vehicles.year_placeholder')}
              disabled={isSubmitting}
              aria-invalid={!!errors.productionYear}
              {...form.register('productionYear')}
            />
            <FieldError errors={[errors.productionYear]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title={t('vehicles.plates')} icon={Cog} description={t('vehicles.plate_roles_info')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {(plates ?? []).map((plate, index) => (
            <Field
              key={plate.role}
              data-invalid={!!errors.plates?.[index]?.plateNumber}
            >
              <FieldLabel htmlFor={`plates.${index}.plateNumber`}>
                {plateRoleLabels[plate.role]}
              </FieldLabel>
              <input type="hidden" {...form.register(`plates.${index}.role`)} />
              <Input
                id={`plates.${index}.plateNumber`}
                placeholder={plate.role === 'JUMBO' ? t('vehicles.plate_jumbo_placeholder') : t('vehicles.plate_placeholder')}
                disabled={isSubmitting}
                aria-invalid={!!errors.plates?.[index]?.plateNumber}
                {...form.register(`plates.${index}.plateNumber`)}
              />
              <FieldError errors={[errors.plates?.[index]?.plateNumber]} />
            </Field>
          ))}
        </div>

        {plateError ? <FieldError>{plateError}</FieldError> : null}
      </FormSection>

      <FormSection title={t('common.notes')}>
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
