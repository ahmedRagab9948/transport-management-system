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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useAssignVehicle } from '../hooks/use-vehicle-assignments';
import { SmartSectorSelector } from './smart-sector-selector';

interface AssignVehicleDialogProps {
  vehicleId: string;
  onSuccess?: () => void;
}

export function AssignVehicleDialog({ vehicleId, onSuccess }: AssignVehicleDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const assignMutation = useAssignVehicle();
  const [open, setOpen] = useState(false);
  const [sectorId, setSectorId] = useState('');
  const [subSectorId, setSubSectorId] = useState('');
  const [notes, setNotes] = useState('');

  const isPending = assignMutation.isPending;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSectorId('');
      setSubSectorId('');
      setNotes('');
    }
    setOpen(open);
  }

  async function handleAssign() {
    if (!subSectorId) return;
    try {
      await assignMutation.mutateAsync({ vehicleId, payload: { subSectorId, notes: notes || undefined } });
      toast({ title: t('sectors.vehicle_assigned'), variant: 'success' });
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message ?? t('sectors.assign_failed');
      toast({ title: t('sectors.assign_failed'), description: message, variant: 'error' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        {t('sectors.assign_vehicle')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sectors.assign_vehicle')}</DialogTitle>
          <DialogDescription>{t('sectors.confirm_assign_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SmartSectorSelector
            sectorId={sectorId}
            subSectorId={subSectorId}
            onSectorChange={setSectorId}
            onSubSectorChange={setSubSectorId}
            disabled={isPending}
          />

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
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button disabled={!subSectorId || isPending} onClick={handleAssign}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('sectors.assign_vehicle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
