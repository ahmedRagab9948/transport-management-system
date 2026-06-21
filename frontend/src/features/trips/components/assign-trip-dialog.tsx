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

interface AssignTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: string) => void;
  isLoading?: boolean;
}

export function AssignTripDialog({ open, onOpenChange, onConfirm, isLoading }: AssignTripDialogProps) {
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
          <DialogTitle>{t('trips.assign_title')}</DialogTitle>
          <DialogDescription>{t('trips.assign_description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="assign-notes" className="text-sm font-medium">{t('common.notes')} ({t('common.optional')})</label>
            <Textarea id="assign-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('trips.assign_notes_placeholder')} className="resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button disabled={isLoading} onClick={() => onConfirm(notes)}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('trips.assign_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
