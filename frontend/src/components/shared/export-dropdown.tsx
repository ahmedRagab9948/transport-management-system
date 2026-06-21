'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';

interface ExportDropdownProps {
  onExportCsv: () => Promise<void> | void;
  onExportExcel?: () => Promise<void> | void;
  onExportPdf?: () => Promise<void> | void;
  disabled?: boolean;
}

export function ExportDropdown({ onExportCsv, onExportExcel, onExportPdf, disabled }: ExportDropdownProps) {
  const { t } = useT();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(format: string, exportFn: (() => Promise<void> | void) | undefined) {
    if (!exportFn) return;
    setExporting(format);
    try {
      await exportFn();
      toast({ title: t('common.export_completed'), variant: 'success' });
    } catch {
      toast({ title: t('common.operation_failed'), description: t('errors.generic'), variant: 'error' });
    } finally {
      setExporting(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm" disabled={disabled || exporting !== null}>
            {exporting ? (
              <>
                <FileDown className="size-4 animate-pulse" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {t('common.export')}
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv', onExportCsv)} disabled={exporting !== null}>
          <FileSpreadsheet className="size-4" />
          {t('common.export_csv')}
        </DropdownMenuItem>
        {onExportExcel ? (
          <DropdownMenuItem onClick={() => handleExport('excel', onExportExcel)} disabled={exporting !== null}>
            <FileText className="size-4" />
            {t('common.export_excel')}
          </DropdownMenuItem>
        ) : null}
        {onExportPdf ? (
          <DropdownMenuItem onClick={() => handleExport('pdf', onExportPdf)} disabled={exporting !== null}>
            <FileText className="size-4" />
            {t('common.export_pdf')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
