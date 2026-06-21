'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideUpSm, DURATIONS } from '@/lib/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { EmptyState } from '../empty-state';
import { ExportDropdown } from '../export-dropdown';
import { FilterChips, type FilterChip } from '../filter-chips';

const VISIBILITY_STORAGE_PREFIX = 'tms_col_visibility_';

function loadVisibility(key: string): VisibilityState {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(VISIBILITY_STORAGE_PREFIX + key);
    return stored ? (JSON.parse(stored) as VisibilityState) : {};
  } catch {
    return {};
  }
}

function saveVisibility(key: string, state: VisibilityState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VISIBILITY_STORAGE_PREFIX + key, JSON.stringify(state));
}

const TABLE_CELL_CLASS = 'h-11 px-2 sm:px-4 py-2 align-middle text-center whitespace-normal md:whitespace-nowrap text-xs leading-4';

export interface DataTableShellProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  footerLabel?: string | null;
  className?: string;
  selectionMode?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  idAccessor?: (row: TData) => string;
  filterChips?: FilterChip[];
  onFilterChipRemove?: (key: string) => void;
  onFilterChipsClear?: () => void;
  hideExport?: boolean;
  emptyAction?: React.ReactNode;
}

function exportToCsv<TData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  filename = 'export.csv',
  onComplete?: () => void,
) {
  const headers = columns
    .filter((col) => col.id !== 'actions')
    .map((col) => {
      if (typeof col.header === 'string') return col.header;
      if (typeof (col as any).accessorKey === 'string')
        return (col as any).accessorKey;
      return col.id ?? '';
    });

  const rows = data.map((row) =>
    headers.map((header) => {
      const col = columns.find(
        (c) =>
          c.id === header ||
          (c as any).accessorKey === header ||
          (typeof c.header === 'string' && c.header === header),
      );
      if (!col) return '';
      const accessorKey = (col as any).accessorKey;
      if (accessorKey) {
        const value = (row as any)[accessorKey];
        return value != null ? String(value) : '';
      }
      return '';
    }),
  );

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  onComplete?.();
}

export function DataTableShell<TData>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder: searchPlaceholderProp,
  searchValue = '',
  onSearchChange,
  emptyTitle: emptyTitleProp,
  emptyDescription: emptyDescriptionProp,
  toolbar,
  footerLabel,
  className,
  selectionMode = false,
  selectedRows,
  onSelectionChange,
  idAccessor,
  filterChips,
  onFilterChipRemove,
  onFilterChipsClear,
  hideExport = false,
  emptyAction,
}: DataTableShellProps<TData>) {
  const { t } = useT();
  const storageKey = useMemo(() => (data.length > 0 ? (data[0] as any).id?.slice(0, 4) ?? 'default' : 'default'), [data]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => loadVisibility(storageKey));
  const [isExporting, setIsExporting] = useState(false);

  const handleVisibilityChange = useCallback(
    (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveVisibility(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const searchPlaceholder = searchPlaceholderProp ?? t('common.search') + '…';
  const emptyTitle = emptyTitleProp ?? t('common.no_results');
  const emptyDescription = emptyDescriptionProp ?? '';

  const allColumns = useMemo(() => {
    if (!selectionMode) return columns;

    return [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            className="size-4 cursor-pointer"
            checked={data.length > 0 && selectedRows?.size === data.length}
            onChange={(e) => {
              if (!onSelectionChange || !idAccessor) return;
              if (e.target.checked) {
                onSelectionChange(new Set(data.map(idAccessor)));
              } else {
                onSelectionChange(new Set());
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="size-4 cursor-pointer"
            checked={selectedRows?.has(idAccessor ? idAccessor(row.original) : (row.original as any).id)}
            onChange={() => {
              if (!onSelectionChange || !idAccessor) return;
              const id = idAccessor(row.original);
              const next = new Set(selectedRows);
              if (next.has(id)) {
                next.delete(id);
              } else {
                next.add(id);
              }
              onSelectionChange(next);
            }}
          />
        ),
        enableSorting: false,
      } as ColumnDef<TData, unknown>,
      ...columns,
    ];
  }, [columns, selectionMode, selectedRows, data, onSelectionChange, idAccessor]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: handleVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const visibleColumns = table.getAllColumns().filter((col) => col.getIsVisible());

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange ? (
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="ps-8"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex flex-wrap items-center gap-2">
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
          {!hideExport && data.length > 0 ? (
            <ExportDropdown
              onExportCsv={async () => {
                setIsExporting(true);
                exportToCsv(data, columns, `${searchPlaceholder.replace('…', '').replace('...', '') || 'export'}.csv`, () => {
                  setIsExporting(false);
                });
              }}
              disabled={isExporting}
            />
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" aria-label={t('common.filter')} />}
            >
              <Columns3 className="size-4" />
              {t('common.filter')}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {table
                .getAllColumns()
                .filter((col) => col.id !== 'actions' && col.id !== 'select')
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(value)}
                  >
                    {typeof col.columnDef.header === 'string'
                      ? col.columnDef.header
                      : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filterChips && filterChips.length > 0 && onFilterChipRemove && onFilterChipsClear ? (
        <FilterChips chips={filterChips} onRemove={onFilterChipRemove} onClearAll={onFilterChipsClear} />
      ) : null}

        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-base">
              <thead className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur-md shadow-[0_1px_2px_0_rgb(0_0_0_/_0.04)] dark:border-border/30 dark:bg-card/95">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/40 transition-colors dark:border-border/30">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'group h-11 px-4 align-middle text-center text-xs font-semibold whitespace-nowrap md:whitespace-nowrap text-muted-foreground tracking-wide uppercase',
                        header.column.getCanSort() && 'cursor-pointer select-none transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                        header.id === 'actions' && 'sticky ltr:right-0 rtl:left-0 z-30 bg-card shadow-sm',
                      )}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? (
                          <span className="inline-flex size-4 items-center justify-center transition-all duration-200">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="size-4 text-primary" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="size-4 text-primary" />
                            ) : (
                              <ArrowUpDown className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors duration-200" />
                            )}
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="h-11 border-b border-border/40">
                      {visibleColumns.map((_, colIndex) => (
                        <td key={colIndex} className={TABLE_CELL_CLASS}>
                          <Skeleton className="h-4 w-4/5 max-w-[12rem]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}

              {!isLoading && table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-0 bg-transparent"
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? table.getRowModel().rows.map((row, rowIndex) => (
                    <motion.tr
                      key={row.id}
                      variants={slideUpSm}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: DURATIONS.normal, delay: rowIndex * DURATIONS.staggerSm }}
                      className="h-11 border-b border-border/40 even:bg-muted/20 dark:border-border/30 dark:even:bg-muted/10"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className={cn(TABLE_CELL_CLASS, cell.column.id === 'actions' && 'sticky ltr:right-0 rtl:left-0 z-10 bg-card shadow-sm')}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>

      {footerLabel !== null ? (
        <p className="text-xs text-muted-foreground">
          {footerLabel ??
            (isLoading ? `${t('common.loading')}` : `${data.length} ${t('common.items')}`)}
        </p>
      ) : null}
    </div>
  );
}
