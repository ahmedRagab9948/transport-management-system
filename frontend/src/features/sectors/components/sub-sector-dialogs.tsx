'use client';

import { useState } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { StatusBadge } from '@/components/shared';
import { SECTOR_STATUS_TONES } from '@/constants/statuses';
import {
  useCreateSubSector,
  useUpdateSubSector,
  useUpdateSubSectorStatus,
} from '../hooks/use-sub-sectors';
import type { SubSector } from '../types/sector.types';

interface SubSectorDialogsProps {
  mode: 'create' | 'edit';
  sectorId: string;
  subSector?: SubSector;
  triggerLabel: string;
  onSuccess?: () => void;
}

export function SubSectorDialogs({ mode, sectorId, subSector, triggerLabel, onSuccess }: SubSectorDialogsProps) {
  const { t } = useT();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(subSector?.name ?? '');
  const [code, setCode] = useState(subSector?.code ?? '');
  const [description, setDescription] = useState(subSector?.description ?? '');

  const createMutation = useCreateSubSector(sectorId);
  const updateMutation = useUpdateSubSector(subSector?.id ?? '');
  const statusMutation = useUpdateSubSectorStatus();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isEdit = mode === 'edit';

  function resetForm() {
    setName(subSector?.name ?? '');
    setCode(subSector?.code ?? '');
    setDescription(subSector?.description ?? '');
  }

  function handleOpenChange(o: boolean) {
    if (!o) resetForm();
    setOpen(o);
  }

  async function handleSave() {
    if (!name.trim() || !code.trim()) return;

    if (isEdit && subSector) {
      await updateMutation.mutateAsync(
        { name: name.trim(), code: code.trim(), description: description.trim() || undefined },
        {
          onSuccess: () => {
            toast({ title: t('sectors.sub_sector_updated'), variant: 'success' });
            setOpen(false);
            onSuccess?.();
          },
          onError: () => {
            toast({ title: t('common.operation_failed'), variant: 'error' });
          },
        },
      );
    } else {
      await createMutation.mutateAsync(
        { name: name.trim(), code: code.trim(), description: description.trim() || undefined },
        {
          onSuccess: () => {
            toast({ title: t('sectors.sub_sector_created'), variant: 'success' });
            setOpen(false);
            onSuccess?.();
          },
          onError: () => {
            toast({ title: t('common.operation_failed'), variant: 'error' });
          },
        },
      );
    }
  }

  async function handleToggleStatus() {
    if (!subSector) return;
    const newStatus = subSector.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await statusMutation.mutateAsync(
      { id: subSector.id, status: newStatus },
      {
        onSuccess: () => {
          toast({ title: t('sectors.sub_sector_status_updated'), variant: 'success' });
          setStatusToggleOpen(false);
          onSuccess?.();
        },
        onError: () => {
          toast({ title: t('common.operation_failed'), variant: 'error' });
        },
      },
    );
  }

  const [statusToggleOpen, setStatusToggleOpen] = useState(false);

  if (mode === 'edit' && subSector) {
    return (
      <>
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label={t('common.edit')}>
          <Pencil className="size-4" />
        </Button>

        <button type="button" onClick={() => setStatusToggleOpen(true)} className="cursor-pointer">
          <StatusBadge status={subSector.status} tone={SECTOR_STATUS_TONES[subSector.status] ?? 'neutral'} />
        </button>

        {/* Edit Dialog */}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('sectors.edit_sub_sector')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('sectors.sub_sector_name')}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('sectors.name_placeholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('sectors.sub_sector_code')}</label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('sectors.code_placeholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('sectors.description')}</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder={t('sectors.description_placeholder')} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" disabled={isPending} />}>
                {t('common.cancel')}
              </DialogClose>
              <Button disabled={isPending || !name.trim() || !code.trim()} onClick={handleSave}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {t('sectors.update_sector')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Toggle Dialog */}
        <Dialog open={statusToggleOpen} onOpenChange={setStatusToggleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('sectors.status_change_title')}</DialogTitle>
              <DialogDescription>
                {t('sectors.confirm_sub_sector_status_change', {
                  status: t(`common_statuses.${subSector.status === 'ACTIVE' ? 'inactive' : 'active'}`),
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-4 py-4">
              <StatusBadge status={subSector.status} tone={SECTOR_STATUS_TONES[subSector.status] ?? 'neutral'} />
              <span className="text-muted-foreground">→</span>
              <StatusBadge
                status={subSector.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                tone={SECTOR_STATUS_TONES[subSector.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'] ?? 'neutral'}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" disabled={statusMutation.isPending} />}>
                {t('common.cancel')}
              </DialogClose>
              <Button disabled={statusMutation.isPending} onClick={handleToggleStatus}>
                {statusMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {t(subSector.status === 'ACTIVE' ? 'sectors.deactivate_sector' : 'sectors.activate_sector')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="outline" size="sm">
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sectors.create_sub_sector')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sectors.sub_sector_name')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('sectors.name_placeholder')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sectors.sub_sector_code')}</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('sectors.code_placeholder')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sectors.description')}</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder={t('sectors.description_placeholder')} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            {t('common.cancel')}
          </DialogClose>
          <Button disabled={isPending || !name.trim() || !code.trim()} onClick={handleSave}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('sectors.create_sub_sector')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
