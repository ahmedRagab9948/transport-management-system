'use client';

import { AlertCircle, Wrench, Gauge, Package, Hash } from 'lucide-react';

import { EmptyState, GlassCard, LoadingSkeleton, PageSection } from '@/components/shared';
import { DetailsLayout, DetailField, DetailSection } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useVehicle } from '../hooks/use-vehicles';
import { VehicleAssignmentSection } from '@/features/sectors/components/vehicle-assignment-section';
import type { VehiclePlateRole } from '../types/vehicle.types';

interface VehicleDetailsPageProps {
  vehicleId: string;
}

export function VehicleDetailsPage({ vehicleId }: VehicleDetailsPageProps) {
  const { t, locale } = useT();
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  };
  const plateRoleLabel = (role: VehiclePlateRole) => t(`vehicles.role_${role.toLowerCase()}`);
  const { hasPermission } = usePermissions();
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_VEHICLE);

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
    </PageSection>
  );
  }

  if (error || !vehicle) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
            <EmptyState
              icon={AlertCircle}
              title={`${t('entities.vehicle')} ${t('errors.not_found')}`}
              description={t('errors.load_failed')}
              actionLabel={t('common.back')}
              onAction={() => window.history.back()}
              className="border-0 bg-transparent"
            />
        </GlassCard>
    </PageSection>
  );
  }

  return (
    <DetailsLayout
      title={`${t('entities.vehicle')} ${vehicle.vehicleCode}`}
      subtitle={`${t(`vehicles.type_${vehicle.type.toLowerCase()}`)} · ${t('common.created_at')} ${formatDate(vehicle.createdAt)}`}
      statusBadge={<StatusBadge status={vehicle.status} domain="vehicle" />}
      editHref={canEdit ? ROUTES.vehiclesEdit(vehicleId) : undefined}
      backHref={ROUTES.vehicles}
    >
      <DetailSection title={t('details.vehicle_specifications')}>
        <DetailField
          label={t('vehicles.manufacturer')}
          value={(
            <span className="flex items-center gap-2">
              <Wrench className="size-3.5 text-muted-foreground" />
              {vehicle.manufacturer ?? '-'}
            </span>
          )}
        />
        <DetailField
          label={t('vehicles.model')}
          value={(
            <span className="flex items-center gap-2">
              <Hash className="size-3.5 text-muted-foreground" />
              {vehicle.model ?? '-'}
            </span>
          )}
        />
        <DetailField
          label={t('vehicles.production_year')}
          value={vehicle.productionYear?.toString() ?? '-'}
        />
        <DetailField
          label={t('vehicles.capacity_kg')}
          value={(
            <span className="flex items-center gap-2">
              <Package className="size-3.5 text-muted-foreground" />
              {vehicle.capacityKg ? `${vehicle.capacityKg.toLocaleString()} kg` : '-'}
            </span>
          )}
        />
        <DetailField
          label={t('vehicles.vehicle_type')}
          value={(
            <span className="flex items-center gap-2">
              <Gauge className="size-3.5 text-muted-foreground" />
              {t(`vehicles.type_${vehicle.type.toLowerCase()}`)}
            </span>
          )}
        />
      </DetailSection>

      <DetailSection title={t('details.plates_information')}>
        {vehicle.plates.length > 0 ? (
          vehicle.plates.map((plate) => (
            <DetailField
              key={plate.id}
              label={plateRoleLabel(plate.role)}
              value={plate.plateNumber}
            />
          ))
        ) : (
          <DetailField label={t('vehicles.plates')} value={t('details.no_plates')} />
        )}
      </DetailSection>

      <VehicleAssignmentSection vehicleId={vehicleId} />

      {vehicle.notes ? (
        <DetailSection title={t('common.notes')}>
          <DetailField label={t('common.notes')} value={vehicle.notes} className="sm:col-span-3" />
        </DetailSection>
      ) : null}
    </DetailsLayout>
  );
}
