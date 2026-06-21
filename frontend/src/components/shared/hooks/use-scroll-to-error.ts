'use client';

import { useCallback } from 'react';
import type { FieldErrors } from 'react-hook-form';

export function useScrollToError<T extends Record<string, unknown>>() {
  const scrollToError = useCallback((errors: FieldErrors<T>) => {
    const keys = Object.keys(errors);
    if (keys.length === 0) return;

    const firstKey = keys[0];
    const element = document.querySelector(`[name="${firstKey}"]`) ?? document.getElementById(firstKey);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (element as HTMLElement).focus();
    }
  }, []);

  return { scrollToError };
}