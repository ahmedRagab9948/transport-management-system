'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useURLParams<T extends Record<string, string | undefined>>(
  defaults: T,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingRef = useRef<number | null>(null);

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const [key, value] of searchParams.entries()) {
      (result as any)[key] = value;
    }
    return result as T;
  }, [searchParams, defaults]);

  const setParams = useCallback(
    (update: Partial<T>, replace = true) => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(update)) {
        if (value === undefined || value === '' || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router[replace ? 'replace' : 'push'](url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const debouncedSetParams = useCallback(
    (update: Partial<T>, delay = 300) => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
      pendingRef.current = window.setTimeout(() => {
        setParams(update, true);
      }, delay);
    },
    [setParams],
  );

  const resetParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { params, setParams, debouncedSetParams, resetParams };
}
