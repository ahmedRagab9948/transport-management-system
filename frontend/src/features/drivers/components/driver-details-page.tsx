'use client';

import { AlertCircle, Phone, IdCard, FileText, User } from 'lucide-react';

import { EmptyState, GlassCard, LoadingSkeleton, PageSection } from '@/components/shared';
import { DetailsLayout, DetailField, DetailSection } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useDriver } from '../hooks/use-drivers';

interface DriverDetailsPageProps {
  driverId: string;
}

export function DriverDetailsPage({ driverId }: DriverDetailsPageProps) {
  const { t, locale } = useT();
  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  };
  const { hasPermission } = usePermissions();
  const { data: driver, isLoading, error } = useDriver(driverId);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_DRIVER);

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
    </PageSection>
  );
  }

  if (error || !driver) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
            <EmptyState
              icon={AlertCircle}
              title={`${t('entities.driver')} ${t('errors.not_found')}`}
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
      title={driver.fullName}
      subtitle={`${t('entities.driver')} · ${t('common.created_at')} ${formatDate(driver.createdAt)}`}
      statusBadge={<StatusBadge status={driver.status} domain="driver" />}
      editHref={canEdit ? ROUTES.driversEdit(driverId) : undefined}
      backHref={ROUTES.drivers}
    >
      <DetailSection title={t('details.general_information')}>
        <DetailField
          label={t('drivers.driver_code')}
          value={(
            <span className="flex items-center gap-2 font-mono">
              {driver.driverCode}
            </span>
          )}
        />
        <DetailField
          label={t('drivers.full_name')}
          value={(
            <span className="flex items-center gap-2">
              <User className="size-3.5 text-muted-foreground" />
              {driver.fullName}
            </span>
          )}
        />
        <DetailField
          label={t('drivers.column_phone')}
          value={(
            <span className="flex items-center gap-2">
              <Phone className="size-3.5 text-muted-foreground" />
              {driver.phone}
            </span>
          )}
        />
        <DetailField
          label={t('drivers.national_id')}
          value={(
            <span className="flex items-center gap-2">
              <IdCard className="size-3.5 text-muted-foreground" />
              {driver.nationalId}
            </span>
          )}
        />
      </DetailSection>

      <DetailSection title={t('details.driver_information')}>
        <DetailField
          label={t('drivers.license_number')}
          value={(
            <span className="flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground" />
              {driver.licenseNumber}
            </span>
          )}
        />
        <DetailField label={t('drivers.license_expiry')} value={formatDate(driver.licenseExpiry)} />
      </DetailSection>

      {driver.notes ? (
        <DetailSection title={t('common.notes')}>
          <DetailField label={t('common.notes')} value={driver.notes} className="sm:col-span-2" />
        </DetailSection>
      ) : null}
    </DetailsLayout>
  );
}
