import { STORAGE_KEYS } from '@tms/shared';

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};
