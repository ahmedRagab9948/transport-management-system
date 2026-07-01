'use client';

import { ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { DetailsLayout, DetailField, DetailSection, EmptyState, PageSection } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useUser } from '../hooks/use-users';
import { UserStatusBadge } from '../components/user-status-badge';

export function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { t } = useT();
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.VIEW_USERS);
  const { data: user, isLoading } = useUser(id);

  if (!canView) {
    return (
      <PageSection variant="wrapper">
        <AppBreadcrumbs />
        <EmptyState
          icon={ShieldAlert}
          title={t('common.no_data')}
          description={t('common.no_permission')}
        />
      </PageSection>
    );
  }

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageSection variant="wrapper">
      <DetailsLayout
        title={user?.fullName ?? t('users.user_details')}
        subtitle={user?.email}
        backHref={ROUTES.users}
        isLoading={isLoading}
        statusBadge={user ? <UserStatusBadge isActive={user.isActive} /> : undefined}
      >
        <DetailSection title={t('users.profile')}>
          <DetailField label={t('users.full_name')} value={user?.fullName} />
          <DetailField label={t('users.email')} value={user?.email} />
          <DetailField label={t('users.phone')} value={user?.phone ?? '-'} />
          <DetailField label={t('users.role')} value={user?.role.name} />
          <DetailField label={t('common.status')} value={user ? <UserStatusBadge isActive={user.isActive} /> : '-'} />
          <DetailField label={t('users.last_login')} value={formatDate(user?.lastLoginAt)} />
          <DetailField label={t('users.created_at')} value={formatDate(user?.createdAt)} />
          <DetailField label={t('users.otp_enabled')} value={user?.otpEnabled ? t('common.yes') : t('common.no')} />
        </DetailSection>

        <DetailSection title={t('users.permissions')}>
          <DetailField label={t('users.role')} value={user?.role.name} />
          <DetailField label={t('users.permissions_count')} value={t('users.role_based')} />
        </DetailSection>

        <DetailSection title={t('users.activity')}>
          <DetailField label={t('users.last_login')} value={formatDate(user?.lastLoginAt)} />
          <DetailField label={t('users.created_at')} value={formatDate(user?.createdAt)} />
          <DetailField label={t('users.updated_at')} value={formatDate(user?.updatedAt)} />
        </DetailSection>

        <DetailSection title={t('users.security')}>
          <DetailField label={t('users.otp_enabled')} value={user?.otpEnabled ? t('common.yes') : t('common.no')} />
          <DetailField label={t('users.last_login')} value={formatDate(user?.lastLoginAt)} />
        </DetailSection>
      </DetailsLayout>
    </PageSection>
  );
}
