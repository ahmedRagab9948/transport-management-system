'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { NavigationItem, NavigationSection } from '@/constants/navigation';
import { useSidebar } from '../context/sidebar-context';

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarNavProps {
  sections: NavigationSection[];
  onNavigate?: () => void;
}

function NavLink({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: NavigationItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useT();
  const Icon = item.icon;
  const labelKey = `nav.${item.id}`;
  const translatedLabel = t(labelKey);
  const label = translatedLabel !== labelKey ? translatedLabel : item.label;

  const content = (
    <>
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200',
          active
            ? 'text-primary'
            : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      {!collapsed && (
        <>
          <span className="truncate text-sm font-medium">{label}</span>
          {item.comingSoon && (
            <Badge
              variant="secondary"
              className="ms-auto border-none bg-sidebar-accent px-2 py-0 text-xs font-semibold uppercase text-sidebar-foreground/70"
            >
              {t('common.soon')}
            </Badge>
          )}
        </>
      )}
    </>
  );

  const className = cn(
    'group relative flex h-10 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors duration-200 cursor-pointer',
    active
      ? 'bg-primary/10 text-primary font-bold before:absolute before:inset-y-0.5 before:-start-2 before:w-1 before:rounded-e-md before:bg-primary'
      : 'text-sidebar-foreground/80 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    item.comingSoon && 'opacity-65 cursor-not-allowed',
    collapsed && 'justify-center px-0',
  );

  if (item.comingSoon) {
    const disabled = (
      <span className={cn(className, 'cursor-not-allowed')} aria-disabled>
        {content}
      </span>
    );
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger render={disabled} />
          <TooltipContent side="right">
            {label} ({t('common.coming_soon')})
          </TooltipContent>
        </Tooltip>
      );
    }
    return disabled;
  }

  const link = (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

export function SidebarNav({ sections, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const { t } = useT();

  return (
    <ScrollArea className="flex-1 px-2">
      <nav className="flex flex-col gap-2 py-2" aria-label={t('common.main_navigation')}>
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            {section.label && !collapsed && (
              <p className="px-2 pb-1 text-xs font-semibold uppercase text-sidebar-foreground/50 select-none">
                {t(`nav.${section.id}`)}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    item={item}
                    collapsed={collapsed}
                    active={isNavItemActive(pathname, item.href)}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
