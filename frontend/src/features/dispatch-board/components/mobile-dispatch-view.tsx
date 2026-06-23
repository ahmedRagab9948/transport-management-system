'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { TripCard } from './trip-card';
import { COLUMN_GROUPS } from '../types/dispatch-board.types';
import type { DispatchBoardTrip, ColumnGroupId } from '../types/dispatch-board.types';

interface Props {
  groups: Record<ColumnGroupId, { statuses: string[]; trips: DispatchBoardTrip[] }>;
  onStatusChange?: (tripId: string, newStatus: string) => void;
}

type TabId = 'all' | 'active' | 'waiting';

export function MobileDispatchView({ groups, onStatusChange }: Props) {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [expandedAll, setExpandedAll] = useState(false);

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'all', label: t('dispatch_board.mobile.tab_all') },
    { id: 'active', label: t('dispatch_board.mobile.tab_active'), badge: Object.values(groups).reduce((sum, g) => sum + g.trips.length, 0) },
    { id: 'waiting', label: t('dispatch_board.mobile.tab_waiting'), badge: groups.arrival?.trips.filter(t => t.status === 'WAITING').length },
  ];

  const filteredGroups = COLUMN_GROUPS.filter((g) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return g.id !== 'completed';
    if (activeTab === 'waiting') return g.id === 'arrival';
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex gap-2 px-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="relative"
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <Badge variant="secondary" className="ms-1.5 text-[10px] px-1.5 py-0">
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpandedAll(!expandedAll)}
          className="ms-auto"
          aria-label={expandedAll ? t('dispatch_board.mobile.collapse_all') : t('dispatch_board.mobile.expand_all')}
        >
          {expandedAll ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
      </div>

      {/* Accordion sections */}
      <ScrollArea className="max-h-[calc(100vh-280px)]">
        <div className="space-y-2 pe-4">
          {filteredGroups.map((group) => {
            const columnTrips = groups[group.id]?.trips ?? [];
            if (columnTrips.length === 0 && activeTab !== 'all') return null;

            return (
              <Collapsible key={group.id} defaultOpen={expandedAll}>
                <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t(group.labelKey)}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {columnTrips.length}
                    </Badge>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2 pb-1">
                  {columnTrips.length > 0 ? (
                    columnTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} onStatusChange={onStatusChange} />
                    ))
                  ) : (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground/60">
                      {t('dispatch_board.mobile.no_trips_in_status')}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
