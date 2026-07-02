'use client';

import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useFilteredNavigation } from '../hooks/use-filtered-navigation';
import { useSidebar } from '../context/sidebar-context';
import { SidebarNav } from './sidebar-nav';

export function AppSidebar() {
  const sections = useFilteredNavigation();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { t, dir } = useT();

  const CollapseIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ExpandIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <aside
      className={cn(
        'fixed start-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out will-change-[width] md:flex',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-sidebar-border px-4 transition-all duration-300',
          collapsed && 'justify-center px-0',
        )}
      >
        <Link
          href={ROUTES.dashboard}
          className={cn(
            'flex items-center gap-3 transition-all duration-200',
            collapsed && 'justify-center',
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Package className="size-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-primary">
                {t('common.app_name')}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <SidebarNav sections={sections} />

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-sidebar-border bg-sidebar p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'flex w-full items-center gap-2 rounded-md text-sidebar-foreground/60 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0',
          )}
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('common.expand_menu') : t('common.collapse_menu')}
        >
          <span className={cn('flex items-center transition-transform duration-300 ease-out', collapsed && 'rotate-180')}>
            <CollapseIcon className="size-4" />
          </span>
          {!collapsed && (
            <span className="text-xs font-medium">
              {t('common.collapse_menu')}
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}
