'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
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
import { useToast } from '@/components/ui/toast';
import { useUnassignVehicle } from '../hooks/use-vehicle-assignments';

interface UnassignVehicleDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UnassignVehicleDialog({ vehicleId, open, onOpenChange, onSuccess }: UnassignVehicleDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const unassignMutation = useUnassignVehicle();
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPending = unassignMutation.isPending;

  async function handleUnassign() {
    try {
      await unassignMutation.mutateAsync({ vehicleId, payload: { notes: notes || undefined } });
      toast({ title: t('sectors.vehicle_unassigned'), variant: 'success' });
      setConfirmOpen(false);
      onOpenChange(false);
      setNotes('');
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message ?? t('sectors.unassign_failed');
      toast({ title: t('sectors.unassign_failed'), description: message, variant: 'error' });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { if (!val) { setNotes('') }; onOpenChange(val) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sectors.unassign_vehicle')}</DialogTitle>
            <DialogDescription>
              {t('sectors.confirm_unassign_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sectors.notes_label')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder={t('sectors.notes_placeholder')}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              {t('common.cancel')}
            </DialogClose>
            <Button disabled={isPending} onClick={() => setConfirmOpen(true)}>
              {t('sectors.unassign_vehicle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sectors.confirm_unassign_title')}</DialogTitle>
            <DialogDescription>{t('sectors.confirm_unassign_desc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              {t('common.cancel')}
            </DialogClose>
            <Button disabled={isPending} onClick={handleUnassign} variant="danger">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('sectors.unassign_vehicle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
