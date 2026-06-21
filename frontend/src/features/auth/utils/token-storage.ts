const ACCESS_TOKEN_KEY = 'tms_access_token';

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
