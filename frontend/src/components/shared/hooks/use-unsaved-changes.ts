'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const confirmNavigation = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Are you sure you want to leave?');
  }, [isDirty]);

  return { confirmNavigation };
}