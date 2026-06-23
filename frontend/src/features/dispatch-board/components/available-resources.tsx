'use client';

import { useT } from '@/lib/i18n';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Truck, UserCircle, Circle } from 'lucide-react';
import type { VehicleResource, DriverResource } from '../types/dispatch-board.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleResource[];
  drivers: DriverResource[];
  isLoading?: boolean;
}

function ResourceIndicator({ available }: { available: boolean }) {
  const { t } = useT();
  return (
    <span className="flex items-center gap-1 text-[11px]">
      <Circle className={available ? 'size-2 fill-emerald-500 text-emerald-500' : 'size-2 fill-muted-foreground/40 text-muted-foreground/40'} />
      {available ? t('dispatch_board.resources.available') : t('dispatch_board.resources.in_trip')}
    </span>
  );
}

export function AvailableResources({ open, onOpenChange, vehicles, drivers, isLoading }: Props) {
  const { t } = useT();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{t('dispatch_board.resources.title')}</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-6 py-4">
            {/* Vehicles */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">{t('dispatch_board.resources.vehicles')}</h4>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ms-auto">
                  {vehicles.filter(v => v.isAvailable).length}/{vehicles.length}
                </Badge>
              </div>
              {vehicles.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-4 text-center">{t('dispatch_board.resources.no_available')}</p>
              ) : (
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{v.vehicleCode}</p>
                        <p className="text-[10px] text-muted-foreground">{v.type}</p>
                        {v.assignedDriver && (
                          <p className="text-[10px] text-muted-foreground/70 truncate">
                            {t('dispatch_board.resources.current_driver')}: {v.assignedDriver.fullName}
                          </p>
                        )}
                      </div>
                      <ResourceIndicator available={v.isAvailable} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drivers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCircle className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">{t('dispatch_board.resources.drivers')}</h4>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ms-auto">
                  {drivers.filter(d => d.isAvailable).length}/{drivers.length}
                </Badge>
              </div>
              {drivers.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-4 text-center">{t('dispatch_board.resources.no_available')}</p>
              ) : (
                <div className="space-y-2">
                  {drivers.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{d.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{t('dispatch_board.resources.driver_phone')}: {d.phone}</p>
                      </div>
                      <ResourceIndicator available={d.isAvailable} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
