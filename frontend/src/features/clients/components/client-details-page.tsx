'use client';

import { AlertCircle, Building2, User, Mail, Phone, MapPin, Receipt } from 'lucide-react';

import { EmptyState, GlassCard, LoadingSkeleton, PageSection } from '@/components/shared';
import { DetailsLayout, DetailField, DetailSection } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useClient } from '../hooks/use-clients';

interface ClientDetailsPageProps {
  clientId: string;
}

export function ClientDetailsPage({ clientId }: ClientDetailsPageProps) {
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
  const { data: client, isLoading, error } = useClient(clientId);
  const canEdit = hasPermission(PERMISSIONS.UPDATE_CLIENT);

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
    </PageSection>
  );
  }

  if (error || !client) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
            <EmptyState
              icon={AlertCircle}
              title={`${t('entities.client')} ${t('errors.not_found')}`}
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
      title={client.companyName}
      subtitle={`${t('entities.client')} · ${t('common.created_at')} ${formatDate(client.createdAt)}`}
      statusBadge={<StatusBadge status={client.status} domain="client" />}
      editHref={canEdit ? ROUTES.clientsEdit(clientId) : undefined}
      backHref={ROUTES.clients}
    >
      <DetailSection title={t('details.general_information')}>
        <DetailField
          label={t('clients.company_name')}
          value={(
            <span className="flex items-center gap-2">
              <Building2 className="size-3.5 text-muted-foreground" />
              {client.companyName}
            </span>
          )}
        />
        <DetailField
          label={t('clients.contact_person')}
          value={(
            <span className="flex items-center gap-2">
              <User className="size-3.5 text-muted-foreground" />
              {client.contactPerson}
            </span>
          )}
        />
        <DetailField
          label={t('common.email')}
          value={(
            <span className="flex items-center gap-2">
              <Mail className="size-3.5 text-muted-foreground" />
              {client.email ?? '-'}
            </span>
          )}
        />
        <DetailField
          label={t('common.phone')}
          value={(
            <span className="flex items-center gap-2">
              <Phone className="size-3.5 text-muted-foreground" />
              {client.phone ?? '-'}
            </span>
          )}
        />
      </DetailSection>

      <DetailSection title={t('clients.tax_and_status')}>
        <DetailField
          label={t('common.address')}
          value={(
            <span className="flex items-center gap-2">
              <MapPin className="size-3.5 text-muted-foreground" />
              {client.address ?? '-'}
            </span>
          )}
        />
        <DetailField
          label={t('clients.tax_number')}
          value={(
            <span className="flex items-center gap-2">
              <Receipt className="size-3.5 text-muted-foreground" />
              {client.taxNumber ?? '-'}
            </span>
          )}
        />
      </DetailSection>

      {client.notes ? (
        <DetailSection title={t('common.notes')}>
          <DetailField label={t('common.notes')} value={client.notes} className="sm:col-span-2" />
        </DetailSection>
      ) : null}
    </DetailsLayout>
  );
}
