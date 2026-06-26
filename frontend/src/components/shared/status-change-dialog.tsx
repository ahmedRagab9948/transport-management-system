'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
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
import { StatusBadge } from './status-badge';
import type { StatusTone } from '@/constants/statuses';

interface StatusOption {
  value: string;
  label: string;
  tone: StatusTone;
}

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  currentStatus: string;
  statusOptions: StatusOption[];
  domain?: 'trip' | 'vehicle' | 'driver' | 'client' | 'contract' | 'sector';
  isLoading?: boolean;
  onConfirm: (newStatus: string) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  title,
  description,
  currentStatus,
  statusOptions,
  isLoading = false,
  onConfirm,
}: StatusChangeDialogProps) {
  const { t } = useT();
  const [selected, setSelected] = useState<string>('');

  const availableOptions = useMemo(
    () => statusOptions.filter((opt) => opt.value !== currentStatus),
    [statusOptions, currentStatus],
  );

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelected('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">{t('common.current_status')}</div>
          <div className="mb-2">
            <StatusBadge status={currentStatus} />
          </div>

          <div className="text-sm font-medium">{t('common.select_new_status')}</div>
          <div className="grid grid-cols-2 gap-2">
            {availableOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-start text-sm transition-colors',
                  selected === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-input hover:bg-accent',
                )}
              >
                <StatusBadge status={option.value} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {availableOptions.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('common.no_data')}</p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button
            disabled={!selected || isLoading}
            onClick={() => onConfirm(selected)}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('common.change_status')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
