'use client';

import { motion } from 'framer-motion';
import { Truck, Navigation, Globe, ShieldCheck, Clock, Car, CheckCircle2, Activity } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { ThemeToggle } from '@/features/layout/components/theme-toggle';
import { GlassCard } from '@/components/shared';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  titleKey: string;
  descriptionKey: string;
  titleParams?: Record<string, string | number>;
  descriptionParams?: Record<string, string | number>;
  children: React.ReactNode;
}

export function AuthShell({ titleKey, descriptionKey, titleParams, descriptionParams, children }: AuthShellProps) {
  const { t, dir } = useT();

  const heroStats = [
    { value: '98.7%', label: t('auth.hero_on_time_delivery'), icon: Clock, iconColor: 'text-success', delay: 0.2 },
    { value: '250+', label: t('dashboard.active_vehicles'), icon: Car, iconColor: 'text-chart-2', delay: 0.3 },
    { value: '1,200+', label: t('auth.hero_completed_trips'), icon: CheckCircle2, iconColor: 'text-success', delay: 0.4 },
    { value: '24/7', label: t('auth.hero_fleet_monitoring'), icon: Activity, iconColor: 'text-chart-5', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background select-none">
      {/* Left side: Product context (Hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border bg-card p-10 text-foreground">

        {/* Top header details */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Truck className="size-5" />
          </div>
          <div>
            <span className="text-sm font-bold uppercase">{t('common.app_name')}</span>
            <span className="block text-xs font-semibold uppercase text-muted-foreground">
              {t('common.app_tagline')}
            </span>
          </div>
        </div>

        {/* Dynamic GPS Map Tracker Vector Graphic */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
            {/* Animated Tracker Paths */}
            <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-border">
              {/* Roads grid layout */}
              <path d="M40 40 L360 40 M40 120 L360 120 M40 200 L360 200" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
              <path d="M100 20 L100 220 M200 20 L200 220 M300 20 L300 220" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />

              {/* Main GPS Route path (Highlight) */}
              <motion.path 
                d="M100 200 L200 200 L200 120 L300 120 L300 40" 
                stroke="oklch(0.62 0.18 260)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Glowing active node pinpoints */}
              <circle cx="100" cy="200" r="6" fill="oklch(0.62 0.18 260)" />
              <circle cx="200" cy="200" r="4" fill="oklch(0.62 0.18 260)" />
              <circle cx="200" cy="120" r="4" fill="oklch(0.62 0.18 260)" />
              <circle cx="300" cy="120" r="4" fill="oklch(0.62 0.18 260)" />
              <circle cx="300" cy="40" r="6" fill="oklch(0.58 0.18 150)" />

              {/* Animated pulse halo around start/end node */}
              <motion.circle cx="300" cy="40" r="12" stroke="oklch(0.58 0.18 150)" strokeWidth="1.5"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </svg>

            {/* Truck navigation indicator card */}
            <motion.div 
              className="absolute flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-lg"
              style={{ top: '35%', [dir === 'rtl' ? 'right' : 'left']: '25%' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                <Navigation className="size-4 rtl:-scale-x-100" />
              </div>
              <div>
                <span className="block text-xs font-bold uppercase text-muted-foreground">
                  {t('auth.hero_active_trip')} MSR-048
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-foreground">
                  {t('auth.hero_en_route')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Copywriting features info */}
          <div className="text-center max-w-sm mt-6">
            <h2 className="text-h4 font-semibold text-foreground">{t('common.app_full_name')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('auth.hero_description')}
            </p>
          </div>
        </div>

        {/* Floating Metrics Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {heroStats.map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-lg border border-border/50 bg-card/60 p-3 shadow-sm backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={cn('size-4', stat.iconColor)} />
                <span className="text-h3 font-semibold text-foreground">{stat.value}</span>
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats capsules */}
        <div className="relative z-10 flex items-center justify-between border-t border-border/60 pt-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="size-4" />
            <span>{t('auth.hero_dual_language')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4" />
            <span>{t('auth.hero_enterprise_session')}</span>
          </div>
        </div>
      </div>

      {/* Right side: Login Form Container */}
      <div className="relative flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top corner toggles layout */}
        <div className={cn("flex items-center gap-2 self-end", dir === 'rtl' ? 'flex-row-reverse' : 'flex-row')}>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Center centered forms layout */}
        <div className="my-auto mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 font-bold text-foreground">{t(titleKey, titleParams)}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(descriptionKey, descriptionParams)}</p>
          </div>

          <GlassCard variant="surface" className="mt-8 p-6 sm:p-8 shadow-lg">
            {children}
          </GlassCard>
        </div>

        {/* Bottom standard copyrights metadata */}
        <p className="text-center text-xs font-medium text-muted-foreground/55 tracking-wide mt-8">
          &copy; {new Date().getFullYear()} {t('common.app_full_name')}. {t('common.all_rights_reserved')}
        </p>
      </div>
    </div>
  );
}
