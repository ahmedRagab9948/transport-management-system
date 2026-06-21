'use client';

import type { LucideIcon } from 'lucide-react';
import { PageHeader, EmptyState, PageSection } from '@/components/shared';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { findNavigationItemByPath } from '@/constants/navigation';
import { useT } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

interface ModulePlaceholderProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Generic placeholder for routes whose business modules are not implemented yet.
 */
export function ModulePlaceholder({ title, description, icon }: ModulePlaceholderProps) {
  const { t } = useT();
  const pathname = usePathname();
  const navItem = findNavigationItemByPath(pathname);
  const resolvedTitle = title ?? (navItem ? t(`nav.${navItem.id}`) : t('common.app_name'));
  const ResolvedIcon = icon ?? navItem?.icon;

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={resolvedTitle}
        description={description ?? t('common.coming_soon_module')}
      />
      <EmptyState
        icon={ResolvedIcon}
        title={t('common.coming_soon_title', { name: resolvedTitle })}
        description={t('common.coming_soon_hint')}
      />
    </PageSection>
  );
}
