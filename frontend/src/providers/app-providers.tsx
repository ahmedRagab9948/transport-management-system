'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/features/auth/context/auth-provider';
import { LocaleProvider, type Locale } from '@/lib/i18n';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) {
  return (
    <ThemeProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <TooltipProvider>
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </QueryProvider>
        </TooltipProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
