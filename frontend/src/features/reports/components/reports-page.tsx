'use client';

import { useState } from 'react';
import { AppBreadcrumbs } from '@/features/layout/components/app-breadcrumbs';
import { PageHeader, PageSection } from '@/components/shared';
import { useT } from '@/lib/i18n';
import { OverviewTab } from './overview-tab';

type ReportTab = 'overview' | 'revenue' | 'utilization';

export function ReportsPage() {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  const TABS: Array<{ key: ReportTab; label: string }> = [
    { key: 'overview', label: t('reports.tab_overview') },
    { key: 'revenue', label: t('reports.tab_revenue') },
    { key: 'utilization', label: t('reports.tab_utilization') },
  ];

  return (
    <PageSection variant="wrapper">
      <AppBreadcrumbs />
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
      />

      <div className="flex gap-1 rounded-lg border p-1 bg-muted/30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            data-active={activeTab === tab.key}
            className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[active=true]:bg-background data-[active=true]:shadow-sm data-[active=true]:text-foreground text-muted-foreground hover:text-foreground"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? <OverviewTab /> : null}
    </PageSection>
  );
}
