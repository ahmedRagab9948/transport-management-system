'use client';

import { AlertCircle, MapPin, Hash } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { useSector } from '../hooks/use-sectors';
import { useSubSectors } from '../hooks/use-sub-sectors';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import {
  DetailsLayout, DetailField, DetailSection, StatusBadge, EmptyState,
  GlassCard, LoadingSkeleton, PageSection, DataTableShell,
} from '@/components/shared';
import { SECTOR_STATUS_TONES } from '@/constants/statuses';
import { SectorStatusToggle } from './sector-status-toggle';
import { SubSectorDialogs } from './sub-sector-dialogs';
import { useUpdateSectorStatus } from '../hooks/use-sectors';


interface SectorDetailPageProps {
  sectorId: string;
}

const TABS = ['information', 'sub-sectors'] as const;
type TabId = (typeof TABS)[number];

export function SectorDetailPage({ sectorId }: SectorDetailPageProps) {
  const { t, locale } = useT();
  const { hasPermission } = usePermissions();
  const { data: sector, isLoading, error } = useSector(sectorId);
  const { data: subSectors = [], isLoading: subLoading } = useSubSectors(sectorId);
  const statusMutation = useUpdateSectorStatus();
  const canEdit = hasPermission(PERMISSIONS.UPDATE_SECTOR);
  const canManageSubSectors = hasPermission(PERMISSIONS.MANAGE_SUB_SECTORS);

  const [activeTab, setActiveTab] = useState<TabId>('information');

  const formatDate = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: '2-digit',
    }).format(new Date(value));
  };

  if (isLoading) {
    return (
      <PageSection variant="wrapper">
        <LoadingSkeleton variant="form" />
      </PageSection>
    );
  }

  if (error || !sector) {
    return (
      <PageSection variant="wrapper">
        <GlassCard variant="surface" className="p-6">
          <EmptyState
            icon={AlertCircle}
            title={`${t('entities.sector')} ${t('errors.not_found')}`}
            description={t('errors.load_failed')}
            actionLabel={t('common.back')}
            onAction={() => window.history.back()}
            className="border-0 bg-transparent"
          />
        </GlassCard>
      </PageSection>
    );
  }

  async function handleStatusChange(newStatus: string) {
    await statusMutation.mutateAsync({ id: sectorId, status: newStatus });
  }

  return (
    <PageSection variant="wrapper">
      <DetailsLayout
        title={sector.name}
        subtitle={`${sector.code} · ${t('common.created_at')} ${formatDate(sector.createdAt)}`}
        statusBadge={
          canEdit ? (
            <SectorStatusToggle
              currentStatus={sector.status}
              isChanging={statusMutation.isPending}
              onChange={handleStatusChange}
            />
          ) : (
            <StatusBadge status={sector.status} tone={SECTOR_STATUS_TONES[sector.status] ?? 'neutral'} />
          )
        }
        editHref={canEdit ? ROUTES.sectorsEdit(sectorId) : undefined}
        backHref={ROUTES.sectors}
      >
        {/* Tab bar */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`sectors.${tab === 'information' ? 'sector_information' : 'sub_sectors'}`)}
            </button>
          ))}
        </div>

        {/* Information Tab */}
        {activeTab === 'information' && (
          <>
            <DetailSection title={t('sectors.general_information')}>
              <DetailField
                label={t('sectors.sector_name')}
                value={(
                  <span className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {sector.name}
                  </span>
                )}
              />
              <DetailField
                label={t('sectors.sector_code')}
                value={(
                  <span className="flex items-center gap-2">
                    <Hash className="size-3.5 text-muted-foreground" />
                    {sector.code}
                  </span>
                )}
              />
              <DetailField
                label={t('sectors.description')}
                value={sector.description ?? '-'}
                className="sm:col-span-2"
              />
            </DetailSection>

            <DetailSection title={t('details.status_information')}>
              <DetailField
                label={t('sectors.sector_status')}
                value={(
                  <StatusBadge status={sector.status} tone={SECTOR_STATUS_TONES[sector.status] ?? 'neutral'} />
                )}
              />
              <DetailField
                label={t('common.created_at')}
                value={formatDate(sector.createdAt)}
              />
              <DetailField
                label={t('common.updated_at')}
                value={formatDate(sector.updatedAt)}
              />
            </DetailSection>
          </>
        )}

        {/* Sub-Sectors Tab */}
        {activeTab === 'sub-sectors' && (
          <div className="space-y-4">
            {canManageSubSectors && (
              <div className="flex justify-end">
                <SubSectorDialogs
                  mode="create"
                  sectorId={sectorId}
                  triggerLabel={t('sectors.new_sub_sector')}
                        onSuccess={() => {}}
                />
              </div>
            )}

            <DataTableShell
              isLoading={subLoading}
              columns={[
                {
                  id: 'ref',
                  header: '#',
                  cell: ({ row }) => <span className="text-sm font-semibold">{row.index + 1}</span>,
                  enableSorting: false,
                },
                {
                  accessorKey: 'name',
                  header: t('sectors.sub_sector_name'),
                  cell: ({ row }) => <span className="text-sm font-semibold">{row.original.name}</span>,
                },
                {
                  accessorKey: 'code',
                  header: t('sectors.sub_sector_code'),
                  cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.code}</span>,
                },
                {
                  accessorKey: 'status',
                  header: t('sectors.sub_sector_status'),
                  cell: ({ row }) => (
                    <StatusBadge status={row.original.status} tone={SECTOR_STATUS_TONES[row.original.status] ?? 'neutral'} />
                  ),
                },
                {
                  id: 'actions',
                  header: t('common.actions'),
                  cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                      <SubSectorDialogs
                        mode="edit"
                        sectorId={sectorId}
                        subSector={row.original}
                        triggerLabel={t('common.edit')}
                  onSuccess={() => {}}
                      />
                    </div>
                  ),
                },
              ]}
              data={subSectors}
              emptyTitle={t('sectors.no_sub_sectors')}
            />
          </div>
        )}
      </DetailsLayout>
    </PageSection>
  );
}
