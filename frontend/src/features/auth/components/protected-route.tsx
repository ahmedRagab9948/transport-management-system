'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '../hooks/use-auth';
import { useT } from '@/lib/i18n';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = pathname !== ROUTES.login ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`${ROUTES.login}${redirect}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label={t('common.loading')} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
