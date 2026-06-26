'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { StatusBadge } from '@/components/shared';
import { SECTOR_STATUS_TONES } from '@/constants/statuses';
import { useT } from '@/lib/i18n';
import type { StatusTone } from '@/constants/statuses';
import type { SectorStatus } from '../types/sector.types';

interface SectorStatusToggleProps {
  currentStatus: SectorStatus;
  isChanging: boolean;
  onChange: (newStatus: SectorStatus) => Promise<void>;
}

export function SectorStatusToggle({ currentStatus, isChanging, onChange }: SectorStatusToggleProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const targetStatus: SectorStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  async function handleConfirm() {
    await onChange(targetStatus);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isChanging}
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        <StatusBadge status={currentStatus} tone={SECTOR_STATUS_TONES[currentStatus] as StatusTone} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sectors.status_change_title')}</DialogTitle>
            <DialogDescription>{t('sectors.status_change_description')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <div className="text-sm font-medium">{t('common.current_status')}</div>
            <StatusBadge status={currentStatus} tone={SECTOR_STATUS_TONES[currentStatus] as StatusTone} />
            <div className="text-sm font-medium">{t('common.select_new_status')}</div>
            <StatusBadge status={targetStatus} tone={SECTOR_STATUS_TONES[targetStatus] as StatusTone} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isChanging} />}>
              {t('common.cancel')}
            </DialogClose>
            <Button disabled={isChanging} onClick={handleConfirm}>
              {isChanging ? <Loader2 className="size-4 animate-spin" /> : null}
              {t(currentStatus === 'ACTIVE' ? 'sectors.deactivate_sector' : 'sectors.activate_sector')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
