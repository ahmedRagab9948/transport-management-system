'use client';

import { createContext, useContext, useCallback, useLayoutEffect, useMemo, useReducer, useSyncExternalStore } from 'react';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

export type Locale = 'en' | 'ar';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  localeVersion: number;
}

const LOCALE_STORAGE_KEY = 'tms_locale';
const LOCALE_COOKIE_NAME = 'tms_locale';

const messages: Record<Locale, Record<string, unknown>> = { en, ar };

// ---- Module-level state + subscriptions (bypasses React context for t()) ----
let _locale: Locale = 'en';
let _listeners: Set<() => void> = new Set();

function _subscribe(callback: () => void): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}

function _getSnapshot(): Locale {
  return _locale;
}

function _emit() {
  _listeners.forEach((fn) => fn());
}

function _setLocale(newLocale: Locale) {
  console.log('[locale] switching to:', newLocale);
  _locale = newLocale;
  localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
  applyLocaleToDOM(newLocale);
  _emit();
}

function _t(key: string, params?: Record<string, string | number>): string {
  const msg = resolveNested(messages[_locale], key) ?? resolveNested(en, key) ?? key;
  return interpolate(msg, params);
}
// ---- end module-level ----

function resolveNested(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

function applyLocaleToDOM(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [localeVersion, setLocaleVersion] = useReducer((v: number) => v + 1, 0);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const resolved: Locale = stored === 'ar' ? 'ar' : 'en';
    _locale = resolved;
    applyLocaleToDOM(resolved);
    _emit();
    setLocaleVersion();
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    _setLocale(newLocale);
    setLocaleVersion();
  }, []);

  const locale: Locale = useSyncExternalStore(_subscribe, _getSnapshot, () => initialLocale);

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const msg = resolveNested(messages[locale], key) ?? resolveNested(en, key) ?? key;
      return interpolate(msg, params);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dir, isRTL, localeVersion }),
    [locale, setLocale, t, dir, isRTL, localeVersion],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT() {
  const { t, locale, dir, isRTL, localeVersion } = useLocale();
  return { t, locale, dir, isRTL, localeVersion };
}
