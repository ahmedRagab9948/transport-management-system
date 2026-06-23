'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useT } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TripCard } from './trip-card';
import type { DispatchBoardTrip } from '../types/dispatch-board.types';

interface Props {
  label: string;
  trips: DispatchBoardTrip[];
  columnWidth?: number;
  onStatusChange?: (tripId: string, newStatus: string) => void;
}

export function StatusColumn({ label, trips, columnWidth = 280, onStatusChange }: Props) {
  const { t } = useT();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trips.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 3,
  });

  return (
    <div
      className="flex shrink-0 flex-col rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm"
      style={{ width: columnWidth }}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">{label}</h3>
        <span className="flex size-5 items-center justify-center rounded-full bg-muted-foreground/10 text-[11px] font-medium text-muted-foreground">
          {trips.length}
        </span>
      </div>
      <ScrollArea className="flex-1 p-2" ref={parentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TripCard
                trip={trips[virtualItem.index]}
                onStatusChange={onStatusChange}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      {trips.length === 0 && (
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-xs text-muted-foreground/60">{t('dispatch_board.mobile.no_trips_in_status')}</p>
        </div>
      )}
    </div>
  );
}
