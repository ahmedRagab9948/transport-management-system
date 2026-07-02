'use client';

import { motion } from 'framer-motion';
import { SidebarProvider, useSidebar } from '@/features/layout/context/sidebar-context';
import { AppSidebar } from '@/features/layout/components/app-sidebar';
import { TopNavbar } from '@/features/layout/components/top-navbar';
import { pageTransition } from '@/lib/design/animation';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const { dir } = useT();

  return (
    <div className={cn(
      'flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
      collapsed ? 'ms-0 md:ms-16' : 'ms-0 md:ms-56',
    )}>
      <TopNavbar />
      <main id="main-content" className="flex flex-1 flex-col overflow-auto">
        <motion.div variants={pageTransition} initial="hidden" animate="visible" className="flex flex-1 flex-col">
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:items-center focus:gap-2 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        Skip to content
      </a>
      <div className="flex min-h-full flex-1">
        <AppSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}

