'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import type { DispatchBoardTrip } from '../types/dispatch-board.types';

interface Props {
  trip: DispatchBoardTrip;
  onStatusChange?: (tripId: string, newStatus: string) => void;
}

export function TripCard({ trip, onStatusChange }: Props) {
  const { t, isRTL } = useT();
  const [expanded, setExpanded] = useState(false);

  const routeArrow = isRTL ? '←' : '→';

  return (
    <div
      className={cn(
        'group rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('dispatch_board.trip_card.trip_number')}: {trip.tripNumber}
            </span>
            <span className="text-[10px] text-muted-foreground/60">•</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <Clock className="size-3" />
              {t('dispatch_board.trip_card.minutes_format', { count: trip.ageMinutes })}
            </span>
          </div>
          <p className="flex items-center gap-1 text-xs text-foreground/90 truncate">
            <MapPin className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{trip.fromLocation}</span>
            <span className="text-muted-foreground/50 mx-0.5">{routeArrow}</span>
            <span className="truncate">{trip.toLocation}</span>
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={trip.status} />
            {trip.client && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                {trip.client.companyName}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 -mt-1 -me-1"
          aria-label={expanded ? t('dispatch_board.trip_card.hide_details') : t('dispatch_board.trip_card.show_details')}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2 text-xs">
          {trip.contract && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dispatch_board.trip_card.contract')}</span>
              <span className="font-medium">{trip.contract.contractNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dispatch_board.trip_card.vehicle')}</span>
            <span className="font-medium">{trip.vehicle.vehicleCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('dispatch_board.trip_card.driver')}</span>
            <span className="font-medium">{trip.driver.fullName}</span>
          </div>
          {trip.cargoDescription && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dispatch_board.trip_card.cargo')}</span>
              <span className="font-medium truncate max-w-[180px]">{trip.cargoDescription}</span>
            </div>
          )}
          {trip.status === 'WAITING' && trip.waitingStartedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('dispatch_board.trip_card.waiting_duration')}</span>
              <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-0 text-[10px]">
                {t('dispatch_board.trip_card.minutes_format', { count: Math.floor((Date.now() - new Date(trip.waitingStartedAt).getTime()) / 60000) })}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
