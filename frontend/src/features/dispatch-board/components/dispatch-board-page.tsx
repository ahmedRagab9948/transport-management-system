'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { DataFetchShell, PageSection } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Can } from '@/components/shared/can';
import { PERMISSIONS } from '@/constants/permissions';
import { slideUp } from '@/lib/design';
import { Filter, RefreshCw, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useDispatchBoardStats, useDispatchBoardTrips, useDispatchResources } from '../hooks/use-dispatch-board';
import { DispatchBoardStats } from './dispatch-board-stats';
import { DispatchKanban } from './dispatch-kanban';
import { MobileDispatchView } from './mobile-dispatch-view';
import { AvailableResources } from './available-resources';
import type { ColumnGroupId } from '../constants/column-groups';

export function DispatchBoardPage() {
  const { t } = useT();
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDispatchBoardStats();
  const { data: boardData, isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useDispatchBoardTrips(includeCancelled);
  const { data: resources, isLoading: resourcesLoading } = useDispatchResources();

  const isLoading = statsLoading || tripsLoading;
  const error = statsError || tripsError;

  const handleRefresh = () => {
    refetchStats();
    refetchTrips();
  };

  const filteredGroups = boardData?.groups
    ? Object.fromEntries(
        Object.entries(boardData.groups).map(([key, group]) => [
          key,
          {
            ...group,
            trips: searchQuery
              ? group.trips.filter(
                  (trip) =>
                    trip.tripNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.client?.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.vehicle.vehicleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    trip.driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
                )
              : group.trips,
          },
        ]),
      )
    : undefined;

  return (
    <PageSection variant="wrapper">
      <PageHeader
        title={t('dispatch_board.title')}
        description={t('dispatch_board.summary')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="size-4" />
            </Button>
            <Can permission={PERMISSIONS.VIEW_DISPATCH_BOARD}>
              <Button variant="outline" size="sm" onClick={() => setResourcesOpen(!resourcesOpen)}>
                {resourcesOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
              </Button>
            </Can>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="size-4" />
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <DataFetchShell isLoading={false} error={error ? (typeof error === 'string' ? error : error?.message) : undefined} onRetry={handleRefresh}>
        {stats && <DispatchBoardStats stats={stats} isLoading={statsLoading} />}
      </DataFetchShell>

      {/* Filters */}
      {showFilters && (
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-end gap-4 rounded-xl border border-border/50 bg-card/40 p-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="search-trips" className="text-xs">{t('dispatch_board.filters.search_trips')}</Label>
            <Input
              id="search-trips"
              placeholder={t('dispatch_board.filters.search_trips')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-56"
            />
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Button
              variant={includeCancelled ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIncludeCancelled(!includeCancelled)}
            >
              {t('dispatch_board.filters.include_cancelled')}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Board */}
      <DataFetchShell isLoading={isLoading} onRetry={handleRefresh}>
        {filteredGroups ? (
          <>
            {/* Desktop/Tablet: Kanban */}
            <div className="hidden sm:block">
              <DispatchKanban groups={filteredGroups as Record<ColumnGroupId, any>} />
            </div>
            {/* Mobile: Accordion */}
            <div className="sm:hidden">
              <MobileDispatchView groups={filteredGroups as Record<ColumnGroupId, any>} />
            </div>
          </>
        ) : null}
      </DataFetchShell>

      {/* Resources Panel */}
      {resources && (
        <AvailableResources
          open={resourcesOpen}
          onOpenChange={setResourcesOpen}
          vehicles={resources.vehicles}
          drivers={resources.drivers}
          isLoading={resourcesLoading}
        />
      )}
    </PageSection>
  );
}
