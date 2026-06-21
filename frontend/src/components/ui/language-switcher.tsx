'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon-sm" aria-label={t('common.language')}>
                  <Languages className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                <span className="me-2 text-base" aria-hidden>
                  🇬🇧
                </span>
                {t('common.english')}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={locale === 'ar'}
                onClick={() => setLocale('ar')}
              >
                <span className="me-2 text-base" aria-hidden>
                  🇸🇦
                </span>
                {t('common.arabic')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <TooltipContent>{t('common.language')}</TooltipContent>
    </Tooltip>
  );
}
