'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';

interface StartTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: string) => void;
  isLoading?: boolean;
  vehicleCode?: string;
  driverName?: string;
  /** i18n key prefix for dialog copy (e.g. 'trips.start_loading') */
  i18nPrefix: string;
  /** Optional override for confirm button label */
  confirmLabel?: string;
}

export function StartTripDialog({ open, onOpenChange, onConfirm, isLoading, vehicleCode, driverName, i18nPrefix, confirmLabel }: StartTripDialogProps) {
  const { t } = useT();
  const [notes, setNotes] = useState('');

  function handleOpenChange(v: boolean) {
    if (!v) setNotes('');
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${i18nPrefix}_title`)}</DialogTitle>
          <DialogDescription>{t(`${i18nPrefix}_description`)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t('trips.vehicle')}</dt>
                <dd className="text-sm font-medium">{vehicleCode ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t('trips.driver')}</dt>
                <dd className="text-sm font-medium">{driverName ?? '-'}</dd>
              </div>
            </div>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="dialog-notes" className="text-sm font-medium">{t('common.notes')} ({t('common.optional')})</label>
            <Textarea id="dialog-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t(`${i18nPrefix}_notes_placeholder`)} className="resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button disabled={isLoading} onClick={() => onConfirm(notes)}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
