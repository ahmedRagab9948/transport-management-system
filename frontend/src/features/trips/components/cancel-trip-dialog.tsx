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

interface CancelTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { reasonCode: string; notes: string }) => void;
  isLoading?: boolean;
}

const CANCEL_REASONS = [
  'CLIENT_CANCELLED',
  'WEATHER_CANCELLED',
  'VEHICLE_UNAVAILABLE',
  'DRIVER_UNAVAILABLE',
  'DISPATCHER_CANCELLED',
] as const;

export function CancelTripDialog({ open, onOpenChange, onConfirm, isLoading }: CancelTripDialogProps) {
  const { t } = useT();
  const [reasonCode, setReasonCode] = useState('');
  const [notes, setNotes] = useState('');

  function handleOpenChange(v: boolean) {
    if (!v) { setReasonCode(''); setNotes(''); }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('trips.cancel_title')}</DialogTitle>
          <DialogDescription>{t('trips.cancel_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <label htmlFor="cancel-reason" className="text-sm font-medium">
              {t('trips.cancel_reason')} <span className="text-destructive">*</span>
            </label>
            <select
              id="cancel-reason"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
            >
              <option value="">{t('validation.select_option')}</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{t(`trips.cancel_reason_${r.toLowerCase()}`)}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="cancel-notes" className="text-sm font-medium">{t('common.notes')} ({t('common.optional')})</label>
            <Textarea id="cancel-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('trips.cancel_notes_placeholder')} className="resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button variant="danger" disabled={!reasonCode || isLoading} onClick={() => onConfirm({ reasonCode, notes })}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('trips.cancel_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
