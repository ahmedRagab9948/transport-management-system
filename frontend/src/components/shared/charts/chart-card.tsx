'use client';

import { memo, useCallback, useRef } from 'react';
import { Download, Maximize2, Minimize2, MoreHorizontal, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/shared/design-system/glass-card';
import { CARD_BODY, CARD_HEADER } from '@/components/shared/design-system/design-tokens';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartCardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: ChartCardAction[];
  onRefresh?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  isLoading?: boolean;
}

export const ChartCard = memo(function ChartCard({
  title,
  description,
  children,
  className,
  actions,
  onRefresh,
  onExport,
  onFullscreen,
  isFullscreen,
  isLoading,
}: ChartCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = useCallback(() => {
    if (onFullscreen) {
      onFullscreen();
    } else if (cardRef.current && !isFullscreen) {
      cardRef.current.requestFullscreen?.();
    }
  }, [onFullscreen, isFullscreen]);

  const hasActions = !!(actions?.length || onRefresh || onExport || onFullscreen);

  return (
    <GlassCard variant="surface" className={cn(className, isFullscreen && 'fixed inset-4 z-50 overflow-auto')}>
      <div className={CARD_HEADER}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          {description ? (
            <p className="truncate text-xs text-muted-foreground/70">{description}</p>
          ) : null}
        </div>
        {hasActions ? (
          <div className="ms-auto flex items-center gap-1">
            {onRefresh ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh chart data"
              >
                <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
              </Button>
            ) : null}
            {onExport ? (
              <Button variant="ghost" size="icon" className="size-7" onClick={onExport} aria-label="Export chart">
                <Download className="size-3.5" />
              </Button>
            ) : null}
            {onFullscreen ? (
              <Button variant="ghost" size="icon" className="size-7" onClick={handleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </Button>
            ) : null}
            {actions && actions.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="More actions">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {actions.map((action, idx) => (
                    <DropdownMenuItem key={idx} onClick={action.onClick}>
                      {action.icon ? <span className="me-2">{action.icon}</span> : null}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={CARD_BODY}>{children}</div>
    </GlassCard>
  );
});
