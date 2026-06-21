'use client';

import { GlobalSearch } from '@/components/shared/global-search';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { NotificationDropdown } from '@/features/notifications';
import { MobileSidebar } from './mobile-sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-35 flex h-14 shrink-0 items-center gap-2 sm:gap-4 border-b border-sidebar-border bg-sidebar px-2 sm:px-6 lg:px-8 transition-colors duration-200">
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <NotificationDropdown />
        <LanguageToggle />
        <ThemeToggle />
        <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
