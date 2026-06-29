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
import { FormSection } from '@/components/shared';
import { useUnsavedChanges } from '@/components/shared/hooks/use-unsaved-changes';
import { useScrollToError } from '@/components/shared/hooks/use-scroll-to-error';
import { VEHICLE_STATUS } from '@tms/shared';
import { useT } from '@/lib/i18n';
import { useFormAutoFocus } from '@/lib/forms';
import type { CreateVehiclePayload, VehiclePlateRole } from '../types/vehicle.types';
import {
  createVehicleSchema,
  type CreateVehicleFormValues,
  type CreateVehicleSubmitValues,
} from '../schemas/vehicle.schema';

interface CreateVehicleFormProps {
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: CreateVehiclePayload) => void;
  onCancel: () => void;
}

const plateRoleLabels: Record<VehiclePlateRole, string> = {
  TRUCK_HEAD: 'vehicles.truck_head',
  TRAILER_UNIT: 'vehicles.trailer_unit',
  JUMBO: 'vehicles.jumbo',
};

const typePlateRoles: Record<CreateVehicleSubmitValues['type'], VehiclePlateRole[]> = {
  TRAILER: ['TRUCK_HEAD', 'TRAILER_UNIT'],
  JUMBO: ['JUMBO'],
};

function buildPlates(type: CreateVehicleSubmitValues['type']) {
  return typePlateRoles[type].map((role) => ({ role, plateNumber: '' }));
}

function createVehicleCode() {
  return `VEH-${Date.now()}`;
}

function toPayload(values: CreateVehicleSubmitValues): CreateVehiclePayload {
  return {
    vehicleCode: values.vehicleCode,
    type: values.type,
    status: values.status,
    manufacturer: values.manufacturer,
    model: values.model,
    productionYear: values.productionYear,
    capacityKg: values.capacityKg,
    notes: values.notes,
    plates: values.plates,
  };
}

export function CreateVehicleForm({
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: CreateVehicleFormProps) {
  const { t } = useT();
  const schema = createVehicleSchema(t);
  const form = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleCode: createVehicleCode(),
      type: 'TRAILER',
      status: 'ACTIVE',
      manufacturer: '',
      model: '',
      productionYear: '',
      capacityKg: '',
      notes: '',
      plates: buildPlates('TRAILER'),
    },
  });
  useFormAutoFocus(form);
  useUnsavedChanges(form.formState.isDirty);
  const { scrollToError } = useScrollToError<CreateVehicleFormValues>();

  const vehicleType = useWatch({ control: form.control, name: 'type' });
  const plates = useWatch({ control: form.control, name: 'plates' });

  useEffect(() => {
    const currentRoles = plates.map((plate) => plate.role).join('|');
    const nextPlates = buildPlates(vehicleType);
    const nextRoles = nextPlates.map((plate) => plate.role).join('|');

    if (currentRoles !== nextRoles) {
      form.setValue('plates', nextPlates, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, plates, vehicleType]);

  const submit = form.handleSubmit(
    (values) => {
      const parsed = schema.parse(values);
      onSubmit(toPayload(parsed));
    },
    () => {
      setTimeout(() => scrollToError(form.formState.errors), 100);
    },
  );

  const plateError =
    typeof form.formState.errors.plates?.message === 'string'
      ? form.formState.errors.plates.message
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
        <FieldGroup className="grid gap-4 lg:grid-cols-2">
        <input type="hidden" {...form.register('vehicleCode')} />

        <Field data-invalid={!!form.formState.errors.type}>
          <FieldLabel htmlFor="type" required>{t('vehicles.vehicle_type')}</FieldLabel>
          <select
            id="type"
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.type}
            {...form.register('type')}
          >
            <option value="TRAILER">{t('vehicles.trailer')}</option>
            <option value="JUMBO">{t('vehicles.jumbo')}</option>
          </select>
          <FieldError errors={[form.formState.errors.type]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.status}>
          <FieldLabel htmlFor="status" required>{t('vehicles.initial_status')}</FieldLabel>
          <select
            id="status"
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.status}
            {...form.register('status')}
          >
            {Object.values(VEHICLE_STATUS).filter((s) => s !== 'IN_TRIP').map((value) => (
              <option key={value} value={value}>
                {t(`common_statuses.${value.toLowerCase()}`)}
              </option>
            ))}
          </select>
          <FieldError errors={[form.formState.errors.status]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.capacityKg}>
          <FieldLabel htmlFor="capacityKg" required>{t('vehicles.capacity_kg')}</FieldLabel>
          <Input
            id="capacityKg"
            type="number"
            min={0}
            placeholder={t('vehicles.capacity_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.capacityKg}
            {...form.register('capacityKg')}
          />
          <FieldError errors={[form.formState.errors.capacityKg]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.manufacturer}>
          <FieldLabel htmlFor="manufacturer" required>{t('vehicles.manufacturer')}</FieldLabel>
          <Input
            id="manufacturer"
            placeholder={t('vehicles.manufacturer_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.manufacturer}
            {...form.register('manufacturer')}
          />
          <FieldError errors={[form.formState.errors.manufacturer]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.model}>
          <FieldLabel htmlFor="model" required>{t('vehicles.model')}</FieldLabel>
          <Input
            id="model"
            placeholder={t('vehicles.model_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.model}
            {...form.register('model')}
          />
          <FieldError errors={[form.formState.errors.model]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.productionYear}>
          <FieldLabel htmlFor="productionYear">{t('vehicles.production_year')}</FieldLabel>
          <Input
            id="productionYear"
            type="number"
            min={1900}
            max={2100}
            placeholder={t('vehicles.year_placeholder')}
            disabled={isSubmitting}
            aria-invalid={!!form.formState.errors.productionYear}
            {...form.register('productionYear')}
          />
          <FieldError errors={[form.formState.errors.productionYear]} />
        </Field>
      </FieldGroup>
      </FormSection>

      <FormSection title={t('vehicles.plates')} icon={Cog} description={t('vehicles.plate_roles_info')}>
        <div className="grid gap-4 lg:grid-cols-2">
          {plates.map((plate, index) => (
            <Field
              key={plate.role}
              data-invalid={!!form.formState.errors.plates?.[index]?.plateNumber}
            >
              <FieldLabel htmlFor={`plates.${index}.plateNumber`}>
                {t(plateRoleLabels[plate.role])}
              </FieldLabel>
              <input type="hidden" {...form.register(`plates.${index}.role`)} />
              <Input
                id={`plates.${index}.plateNumber`}
                placeholder={plate.role === 'JUMBO' ? t('vehicles.plate_jumbo_placeholder') : t('vehicles.plate_placeholder')}
                disabled={isSubmitting}
                aria-invalid={!!form.formState.errors.plates?.[index]?.plateNumber}
                {...form.register(`plates.${index}.plateNumber`)}
              />
              <FieldError errors={[form.formState.errors.plates?.[index]?.plateNumber]} />
            </Field>
          ))}
        </div>
        {plateError ? <FieldError>{plateError}</FieldError> : null}
      </FormSection>

      <FormSection title={t('common.notes')}>
        <Field data-invalid={!!form.formState.errors.notes}>
        <FieldLabel htmlFor="notes">{t('common.notes')}</FieldLabel>
        <Textarea
          id="notes"
          rows={4}
          disabled={isSubmitting}
          placeholder={t('common.notes')}
          aria-invalid={!!form.formState.errors.notes}
          {...form.register('notes')}
        />
        <FieldError errors={[form.formState.errors.notes]} />
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
          {t('vehicles.create_vehicle')}
        </Button>
      </div>
    </motion.form>
  );
}
