'use client';

import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useSectors } from '../hooks/use-sectors';
import { useSubSectors } from '../hooks/use-sub-sectors';
import type { SectorStatus } from '../types/sector.types';

interface SmartSectorSelectorProps {
  sectorId: string;
  subSectorId: string;
  onSectorChange: (sectorId: string) => void;
  onSubSectorChange: (subSectorId: string) => void;
  disabled?: boolean;
  excludeSubSectorId?: string;
}

export function SmartSectorSelector({
  sectorId,
  subSectorId,
  onSectorChange,
  onSubSectorChange,
  disabled,
  excludeSubSectorId,
}: SmartSectorSelectorProps) {
  const { t } = useT();
  const { data: sectorsData, isLoading: sectorsLoading } = useSectors({
    page: 1,
    limit: 100,
    status: 'ACTIVE' as SectorStatus,
  });

  const activeSectors = useMemo(
    () => (sectorsData?.items ?? []).filter((s) => s.status === 'ACTIVE'),
    [sectorsData],
  );

  const { data: subSectors = [], isLoading: subSectorsLoading } = useSubSectors(sectorId);

  const activeSubSectors = useMemo(
    () => subSectors
      .filter((ss) => ss.status === 'ACTIVE' && ss.id !== excludeSubSectorId),
    [subSectors, excludeSubSectorId],
  );

  const hasSingleSubSector = activeSubSectors.length === 1;

  useEffect(() => {
    if (hasSingleSubSector && subSectorId !== activeSubSectors[0].id) {
      onSubSectorChange(activeSubSectors[0].id);
    }
  }, [hasSingleSubSector, activeSubSectors, subSectorId, onSubSectorChange]);

  if (sectorsLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('sectors.select_sector')}</label>
        <select
          value={sectorId}
          onChange={(e) => {
            onSectorChange(e.target.value);
            onSubSectorChange('');
          }}
          disabled={disabled || sectorsLoading}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <option value="">{t('sectors.select_sector')}</option>
          {activeSectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>

      {sectorId && !hasSingleSubSector && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('sectors.select_sub_sector')}</label>
          {subSectorsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t('common.loading')}
            </div>
          ) : (
            <select
              value={subSectorId}
              onChange={(e) => onSubSectorChange(e.target.value)}
              disabled={disabled}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <option value="">{t('sectors.select_sub_sector')}</option>
              {activeSubSectors.map((subSector) => (
                <option key={subSector.id} value={subSector.id}>
                  {subSector.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {sectorId && hasSingleSubSector && (
        <p className="text-xs text-muted-foreground">
          {activeSubSectors[0]?.name}
        </p>
      )}
    </div>
  );
}
