'use client';

import { AlertTriangle, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useT } from '@/lib/i18n';

interface ConflictWarning {
  type: string;
  severity: string;
  message: string;
  conflictingTripId: string;
  conflictingTripNumber: string;
}

interface ConflictWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warnings: ConflictWarning[];
  onContinue: () => void;
  onEditDates: () => void;
  isLoading?: boolean;
}

export function ConflictWarningDialog({
  open,
  onOpenChange,
  warnings,
  onContinue,
  onEditDates,
  isLoading,
}: ConflictWarningDialogProps) {
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>{t('trips.conflict_title')}</DialogTitle>
              <DialogDescription>{t('trips.conflict_description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
              <CalendarX className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{w.message}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{t('trips.conflict_trip')}: {w.conflictingTripNumber}</span>
                  <span>{t('trips.conflict_type')}: {w.type}</span>
                  <span>{t('common.status')}: {w.severity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onEditDates} disabled={isLoading}>
            {t('trips.conflict_edit_dates')}
          </Button>
          <Button variant="primary" onClick={onContinue} disabled={isLoading}>
            {t('trips.conflict_continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
