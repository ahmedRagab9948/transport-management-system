'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getBreadcrumbsForPath } from '@/constants/navigation';

export function useBreadcrumbs() {
  const pathname = usePathname();

  return useMemo(() => getBreadcrumbsForPath(pathname), [pathname]);
}
