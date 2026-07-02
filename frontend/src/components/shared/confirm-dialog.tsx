'use client';

import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
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
import { useT } from '@/lib/i18n';
import { DURATIONS, dialogContent } from '@/lib/design/animation';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useT();
  const resolvedConfirm = confirmLabel ?? t('common.confirm');
  const resolvedCancel = cancelLabel ?? t('common.cancel');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <motion.div
          variants={dialogContent}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              {variant === 'danger' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10"
                >
                  <AlertTriangle className="size-5 text-destructive" />
                </motion.div>
              )}
              <div className="flex flex-col gap-1">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isLoading} />}>
              {resolvedCancel}
            </DialogClose>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              disabled={isLoading}
              onClick={onConfirm}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              {resolvedConfirm}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
