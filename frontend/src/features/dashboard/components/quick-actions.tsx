'use client';

import { BarChart3, Building2, LayoutList, PlusCircle, Truck, UserPlus, Zap } from 'lucide-react';
import Link from 'next/link';
import { GlassCard, SectionHeader } from '@/components/shared';
import { CARD_BODY } from '@/components/shared/design-system/design-tokens';
import { buttonVariants } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { labelKey: 'trips.new_trip', icon: PlusCircle, href: '/trips/new' },
  { labelKey: 'drivers.new_driver', icon: UserPlus, href: '/drivers/new' },
  { labelKey: 'clients.new_client', icon: Building2, href: '/clients/new' },
  { labelKey: 'reports.title', icon: BarChart3, href: '/reports' },
  { labelKey: 'trips.title', icon: LayoutList, href: '/trips' },
  { labelKey: 'vehicles.title', icon: Truck, href: '/vehicles' },
] as const;

export function QuickActions() {
  const { t } = useT();
  return (
    <GlassCard variant="surface">
      <SectionHeader title={t('dashboard.quick_actions')} icon={Zap} />
      <div className={CARD_BODY}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'sm' }),
                'justify-start gap-2.5 h-auto py-2.5 px-3',
              )}
            >
              <action.icon className="size-4 shrink-0" />
              <span className="truncate">{t(action.labelKey)}</span>
            </Link>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
