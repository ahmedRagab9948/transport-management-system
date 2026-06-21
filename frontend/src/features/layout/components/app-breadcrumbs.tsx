'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useT } from '@/lib/i18n';
import { useBreadcrumbs } from '../hooks/use-breadcrumbs';

export function AppBreadcrumbs() {
  const crumbs = useBreadcrumbs();
  const { t } = useT();

  return (
    <Breadcrumb className="text-sm">
      <BreadcrumbList className="gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const label = crumb.labelKey ? t(crumb.labelKey) : crumb.label;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator className="text-muted-foreground/50" /> : null}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="font-medium text-foreground truncate">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />} className="text-muted-foreground hover:text-foreground transition-colors">{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
