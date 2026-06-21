'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useT } from '@/lib/i18n';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useT();

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : true;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={isDark ? t('common.switch_to_light') : t('common.switch_to_dark')}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <span className="relative inline-flex items-center justify-center">
              <Sun
                className={`size-4 transition-all duration-300 ${
                  isDark
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0'
                }`}
                style={{ position: isDark ? 'relative' : 'absolute' }}
              />
              <Moon
                className={`size-4 transition-all duration-300 ${
                  isDark
                    ? 'rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                }`}
                style={{ position: isDark ? 'absolute' : 'relative' }}
              />
            </span>
          </Button>
        }
      />
      <TooltipContent>{isDark ? t('common.light_mode') : t('common.dark_mode')}</TooltipContent>
    </Tooltip>
  );
}
