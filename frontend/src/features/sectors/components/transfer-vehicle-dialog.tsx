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
import { useTransferVehicle } from '../hooks/use-vehicle-assignments';
import { SmartSectorSelector } from './smart-sector-selector';

interface TransferVehicleDialogProps {
  vehicleId: string;
  currentSubSectorId?: string;
  onSuccess?: () => void;
}

export function TransferVehicleDialog({ vehicleId, currentSubSectorId, onSuccess }: TransferVehicleDialogProps) {
  const { t } = useT();
  const { toast } = useToast();
  const transferMutation = useTransferVehicle();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sectorId, setSectorId] = useState('');
  const [subSectorId, setSubSectorId] = useState('');

  const isPending = transferMutation.isPending;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSectorId('');
      setSubSectorId('');
    }
    setOpen(open);
  }

  async function handleTransfer() {
    if (!subSectorId) return;
    try {
      await transferMutation.mutateAsync({ vehicleId, payload: { targetSubSectorId: subSectorId } });
      toast({ title: t('sectors.vehicle_transferred'), variant: 'success' });
      setConfirmOpen(false);
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message ?? t('sectors.transfer_failed');
      toast({ title: t('sectors.transfer_failed'), description: message, variant: 'error' });
      setConfirmOpen(false);
    }
  }

  const selectorContent = (
    <SmartSectorSelector
      sectorId={sectorId}
      subSectorId={subSectorId}
      onSectorChange={setSectorId}
      onSubSectorChange={setSubSectorId}
      disabled={isPending}
      excludeSubSectorId={currentSubSectorId}
    />
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          {t('sectors.transfer_vehicle')}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sectors.transfer_vehicle')}</DialogTitle>
            <DialogDescription>{t('sectors.select_sub_sector')}</DialogDescription>
          </DialogHeader>

          {selectorContent}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              {t('common.cancel')}
            </DialogClose>
            <Button disabled={!subSectorId || isPending} onClick={() => setConfirmOpen(true)}>
              {t('common.next')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sectors.confirm_transfer_title')}</DialogTitle>
            <DialogDescription>{t('sectors.confirm_transfer_desc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              {t('common.cancel')}
            </DialogClose>
            <Button disabled={isPending} onClick={handleTransfer}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('sectors.transfer_vehicle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
