'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { DetailSection, DetailField } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { GlassCard } from '@/components/shared';
import { Can } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { useVehicleAssignment } from '../hooks/use-vehicle-assignments';
import { AssignVehicleDialog } from './assign-vehicle-dialog';
import { TransferVehicleDialog } from './transfer-vehicle-dialog';
import { UnassignVehicleDialog } from './unassign-vehicle-dialog';

interface VehicleAssignmentSectionProps {
  vehicleId: string;
}

export function VehicleAssignmentSection({ vehicleId }: VehicleAssignmentSectionProps) {
  const { t, locale } = useT();
  const { hasPermission } = usePermissions();
  const { data: assignment, isLoading, error, refetch } = useVehicleAssignment(vehicleId);
  const [unassignOpen, setUnassignOpen] = useState(false);

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  };

  const canView = hasPermission(PERMISSIONS.VIEW_VEHICLE_ASSIGNMENTS);

  if (!canView) return null;

  if (isLoading) {
    return (
      <DetailSection title={t('sectors.assignment_section_title')}>
        <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t('common.loading')}
        </div>
      </DetailSection>
    );
  }

  if (error && !assignment) {
    return (
      <DetailSection title={t('sectors.assignment_section_title')}>
        <div className="col-span-full">
          <GlassCard variant="surface" className="p-4">
            <p className="text-sm text-destructive">{t('errors.load_failed')}</p>
          </GlassCard>
        </div>
      </DetailSection>
    );
  }

  return (
    <DetailSection
      title={t('sectors.assignment_section_title')}
    >
      {assignment && assignment.subSector ? (
        <>
          <DetailField
            label={t('sectors.current_sector')}
            value={assignment.subSector.sector?.name ?? assignment.subSector.name}
          />
          <DetailField
            label={t('sectors.current_sub_sector')}
            value={assignment.subSector.name}
          />
          <DetailField
            label={t('sectors.assigned_at')}
            value={formatDate(assignment.assignedAt)}
          />
          <DetailField
            label={t('sectors.assignment_status')}
            value={<StatusBadge status="ACTIVE" domain="client" />}
          />

          {assignment.notes && (
            <DetailField
              label={t('sectors.notes_label')}
              value={assignment.notes}
              className="sm:col-span-2"
            />
          )}

          <div className="col-span-full flex flex-wrap items-center gap-2 pt-2">
            <Can permission={PERMISSIONS.TRANSFER_VEHICLE}>
              <TransferVehicleDialog
                vehicleId={vehicleId}
                currentSubSectorId={assignment.subSectorId}
                onSuccess={refetch}
              />
            </Can>
            <Can permission={PERMISSIONS.UNASSIGN_VEHICLE}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUnassignOpen(true)}
              >
                {t('sectors.unassign_vehicle')}
              </Button>
            </Can>
          </div>
        </>
      ) : (
        <>
          <DetailField
            label={t('sectors.assignment_status')}
            value={t('sectors.not_assigned')}
          />

          <div className="col-span-full pt-2">
            <Can permission={PERMISSIONS.ASSIGN_VEHICLE}>
              <AssignVehicleDialog
                vehicleId={vehicleId}
                onSuccess={refetch}
              />
            </Can>
          </div>
        </>
      )}

      <UnassignVehicleDialog
        vehicleId={vehicleId}
        open={unassignOpen}
        onOpenChange={setUnassignOpen}
        onSuccess={refetch}
      />
    </DetailSection>
  );
}
