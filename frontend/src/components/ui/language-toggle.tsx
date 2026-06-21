'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocale } from '@/lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  const nextLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 px-2 sm:px-2.5 text-xs font-medium"
            onClick={() => setLocale(nextLocale)}
            aria-label={t('common.language')}
          >
            <Languages className="size-3.5" />
            <span className="hidden sm:inline">{locale === 'en' ? 'العربية' : 'English'}</span>
          </Button>
        }
      />
      <TooltipContent>
        {locale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
      </TooltipContent>
    </Tooltip>
  );
}
