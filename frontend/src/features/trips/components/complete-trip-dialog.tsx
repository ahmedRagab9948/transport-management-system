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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';

interface CompleteTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { actualEndDate?: string; notes: string }) => void;
  isLoading?: boolean;
}

export function CompleteTripDialog({ open, onOpenChange, onConfirm, isLoading }: CompleteTripDialogProps) {
  const { t } = useT();
  const [notes, setNotes] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');

  function handleOpenChange(v: boolean) {
    if (!v) { setNotes(''); setActualEndDate(''); }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('trips.complete_title')}</DialogTitle>
          <DialogDescription>{t('trips.complete_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <label htmlFor="complete-end-date" className="text-sm font-medium">{t('trips.actual_end_date')} ({t('common.optional')})</label>
            <Input id="complete-end-date" type="datetime-local" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="complete-notes" className="text-sm font-medium">{t('common.notes')} ({t('common.optional')})</label>
            <Textarea id="complete-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('trips.complete_notes_placeholder')} className="resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button disabled={isLoading} onClick={() => onConfirm({ actualEndDate: actualEndDate || undefined, notes })}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('trips.complete_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
