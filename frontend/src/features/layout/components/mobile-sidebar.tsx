'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ROUTES } from '@/constants/routes';
import { useT } from '@/lib/i18n';
import { useFilteredNavigation } from '../hooks/use-filtered-navigation';
import { useSidebar } from '../context/sidebar-context';
import { SidebarNav } from './sidebar-nav';

export function MobileSidebar() {
  const { t, dir } = useT();
  const sections = useFilteredNavigation();
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger
        render={
          <Button type="button" variant="outline" size="icon-sm" className="md:hidden">
            <Menu className="size-4" />
            <span className="sr-only">{t('common.open_menu')}</span>
          </Button>
        }
      />
      <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-3 text-start">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xs font-bold">{t('common.app_name').charAt(0)}</span>
            </div>
            <Link href={ROUTES.dashboard} onClick={() => setMobileOpen(false)}>
              {t('common.app_name')}
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav sections={sections} onNavigate={() => setMobileOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
