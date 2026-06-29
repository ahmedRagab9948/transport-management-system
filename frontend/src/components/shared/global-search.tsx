'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Route, Truck, UserCircle, Contact, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { scaleIn, DURATIONS } from '@/lib/design';
import { useT } from '@/lib/i18n';

interface SearchResult {
  entity: string;
  id: string;
  label: string;
  icon: typeof Route;
  href: string;
}

const SEARCH_ENTITIES = [
  { entity: 'trips', icon: Route, href: (id: string) => ROUTES.tripsDetail(id), labelKey: 'trips.title', labelField: 'tripNumber' },
  { entity: 'drivers', icon: UserCircle, href: (id: string) => ROUTES.driversDetail(id), labelKey: 'drivers.title', labelField: 'fullName' },
  { entity: 'vehicles', icon: Truck, href: (id: string) => ROUTES.vehiclesDetail(id), labelKey: 'vehicles.title', labelField: 'vehicleCode' },
  { entity: 'clients', icon: Contact, href: (id: string) => ROUTES.clientsDetail(id), labelKey: 'clients.title', labelField: 'companyName' },
  { entity: 'contracts', icon: FileText, href: (id: string) => ROUTES.contractsDetail(id), labelKey: 'contracts.title', labelField: 'contractNumber' },
] as const;

function useGlobalSearch(query: string) {
  const { t } = useT();
  const enabled = query.length >= 2;

  const { data: results, isFetching } = useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      const params = { search: query, limit: '5' };
      const combined: SearchResult[] = [];

      const responses = await Promise.allSettled(
        SEARCH_ENTITIES.map((e) =>
          apiClient.get(`/${e.entity}`, { params }).then((r) => unwrapApiResponse<{ items: Record<string, unknown>[] }>(r)),
        ),
      );

      responses.forEach((resp, idx) => {
        if (resp.status !== 'fulfilled') return;
        const entity = SEARCH_ENTITIES[idx];
        const items = resp.value.items ?? [];
        for (const item of items.slice(0, 3)) {
          const label = String(item[entity.labelField] ?? item.id);
          combined.push({
            entity: t(entity.labelKey),
            id: String(item.id),
            label,
            icon: entity.icon,
            href: entity.href(String(item.id)),
          });
        }
      });

      return combined;
    },
    enabled,
    staleTime: 30_000,
    gcTime: 60_000,
  });

  return { results: results ?? [], isFetching: enabled && isFetching };
}

export function GlobalSearch() {
  const { t } = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results, isFetching } = useGlobalSearch(query);

  function handleSelect(result: SearchResult) {
    setIsOpen(false);
    setQuery('');
    router.push(result.href);
  }

  function handleBlur() {
    setTimeout(() => setIsOpen(false), 200);
  }

  function handleFocus() {
    if (results.length > 0 || (query.length >= 2)) {
      setIsOpen(true);
    }
  }

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <div className="relative group">
        <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none transition-colors group-focus-within:text-primary" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('common.search_global')}
          className="h-9 ps-8 pe-8 text-sm bg-muted/20 border-border/80 transition-all duration-200 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
          aria-label={t('common.search')}
        />
          {isFetching && (
          <div className="absolute end-2.5 top-1/2 size-4 -translate-y-1/2">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/60 border-t-transparent" />
          </div>
        )}
      </div>
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: DURATIONS.fast }}
            className="absolute top-full start-0 z-50 mt-1.5 w-full rounded-xl border border-border/60 bg-popover/95 p-1.5 shadow-lg backdrop-blur-md origin-top">
          <div className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/50 border-b border-border/40 mb-1">
            {t('common.search')}
          </div>
          <div className="flex flex-col gap-0.5">
            {results.map((result) => {
              const Icon = result.icon;
              return (
                <button
                  key={`${result.entity}-${result.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-start transition-all duration-150 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-none focus-visible:bg-accent/80 focus-visible:text-accent-foreground active:scale-[0.99]"
                  onClick={() => handleSelect(result)}
                  onMouseDown={(e) => e.preventDefault()}
                  role="option"
                  aria-label={t('search.result_label', { entity: result.entity, label: result.label })}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground group-hover/search-item:bg-primary/10 group-hover/search-item:text-primary">
                    <Icon className="size-4 shrink-0" aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold tracking-tight text-foreground">{result.label}</span>
                    <span className="truncate text-xs font-medium text-muted-foreground/75 uppercase tracking-wide mt-0.5">{result.entity}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
