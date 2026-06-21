'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ExportDropdown } from './export-dropdown';

export interface PageHeaderActionsProps {
  exportDisabled?: boolean;
  onExportCsv?: () => void;
  createHref?: string;
  createLabel?: string;
  canCreate?: boolean;
}

export function PageHeaderActions({ exportDisabled, onExportCsv, createHref, createLabel, canCreate }: PageHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onExportCsv ? (
        <ExportDropdown onExportCsv={onExportCsv} disabled={exportDisabled} />
      ) : null}
      {canCreate && createHref ? (
        <Link href={createHref} className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" />
          {createLabel}
        </Link>
      ) : null}
    </div>
  );
}
