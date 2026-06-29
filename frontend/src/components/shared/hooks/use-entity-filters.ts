'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@tms/shared';
import { useT } from '@/lib/i18n';

export interface FilterChipDef {
  key: string;
  labelKey: string;
  valueFormatter?: (value: string) => string | undefined;
  hideValue?: boolean;
}

export interface UseEntityFiltersOptions<T extends Record<string, string | boolean | undefined>> {
  defaults: T;
  chips: FilterChipDef[];
  namespace: string;
}

export function useEntityFilters<T extends Record<string, string | boolean | undefined>>({
  defaults,
  chips,
  namespace,
}: UseEntityFiltersOptions<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useT();

  const filters = useMemo(() => {
    const result = { ...defaults } as Record<string, string | boolean | undefined>;
    for (const key of Object.keys(defaults)) {
      const param = searchParams.get(key);
      if (param !== null) {
        if (typeof defaults[key] === 'boolean') {
          (result as any)[key] = param === 'true';
        } else {
          result[key] = param;
        }
      }
    }
    return result as T;
  }, [searchParams, defaults]);

  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>, resetPage: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === 'false') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      if (resetPage) {
        params.delete('page');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setFilter = useCallback(
    (key: keyof T, value: any) => {
      const strValue = value === undefined || value === false ? undefined : String(value);
      const resetPage = key !== 'page';
      updateUrl({ [key as string]: strValue }, resetPage);
    },
    [updateUrl],
  );

  const setFilters = useCallback(
    (updates: Partial<T>) => {
      const strUpdates: Record<string, string | undefined> = {};
      let hasNonPageFilter = false;
      for (const [key, value] of Object.entries(updates)) {
        strUpdates[key] = value === undefined || value === false ? undefined : String(value);
        if (key !== 'page') {
          hasNonPageFilter = true;
        }
      }
      updateUrl(strUpdates, hasNonPageFilter);
    },
    [updateUrl],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== false &&
        defaults[key] !== value,
    );
  }, [filters, defaults]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = { page: DEFAULT_PAGE, limit: DEFAULT_PAGE_SIZE };
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== false) {
        params[key] = value;
      }
    }
    const pageParam = searchParams.get('page');
    if (pageParam) params.page = Number(pageParam);
    const limitParam = searchParams.get('limit');
    if (limitParam) params.limit = Number(limitParam);
    params.page = Number(params.page) || 1;
    params.limit = Number(params.limit) || 20;
    return params as T & { page: number; limit: number };
  }, [filters, searchParams]);

  const filterChips = useMemo(() => {
    return chips
      .filter((chip) => {
        const value = filters[chip.key as keyof T];
        return value !== undefined && value !== '' && value !== false;
      })
      .map((chip) => {
        const raw = filters[chip.key as keyof T] as string | undefined;
        const formatted = chip.valueFormatter && raw ? chip.valueFormatter(raw) : raw;
        return {
          key: chip.key,
          label: t(chip.labelKey),
          value: chip.hideValue ? undefined : formatted,
        };
      });
  }, [filters, chips, t]);

  const removeFilterChip = useCallback(
    (key: string) => {
      setFilter(key as keyof T, undefined);
    },
    [setFilter],
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    queryParams,
    filterChips,
    hasActiveFilters,
    removeFilterChip,
  };
}
