'use client';

import { useT } from '@/lib/i18n';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { StatusColumn } from './status-column';
import { COLUMN_GROUPS } from '../constants/column-groups';
import type { DispatchBoardTrip } from '../types/dispatch-board.types';
import type { ColumnGroupId } from '../constants/column-groups';

interface Props {
  groups: Record<ColumnGroupId, { statuses: string[]; trips: DispatchBoardTrip[] }>;
  onStatusChange?: (tripId: string, newStatus: string) => void;
}

export function DispatchKanban({ groups, onStatusChange }: Props) {
  const { t } = useT();

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-3 pb-4 px-1" style={{ minWidth: COLUMN_GROUPS.length * 280 + (COLUMN_GROUPS.length - 1) * 12 }}>
        {COLUMN_GROUPS.map((group) => (
          <StatusColumn
            key={group.id}
            label={t(group.labelKey)}
            trips={groups[group.id]?.trips ?? []}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
