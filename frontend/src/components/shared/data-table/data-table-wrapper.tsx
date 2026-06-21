'use client';

import { type UseQueryResult } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { FilterChip } from '../filter-chips';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { DataFetchShell } from '../data-fetch-shell';
import { DataTablePagination } from './data-table-pagination';
import { DataTableShell } from './data-table-shell';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<TData> {
  items: TData[];
  meta: PaginationMeta;
}

export interface DataTableWrapperProps<TData> {
  query: UseQueryResult<PaginatedResponse<TData>>;
  columns: ColumnDef<TData, unknown>[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterChips?: FilterChip[];
  onFilterChipRemove?: (key: string) => void;
  onFilterChipsClear?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  toolbar?: React.ReactNode;
  hideExport?: boolean;
  footerLabel?: string | null;
  className?: string;
  selectionMode?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  idAccessor?: (row: TData) => string;
  errorTitle?: string;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTableWrapper<TData>({
  query,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterChips,
  onFilterChipRemove,
  onFilterChipsClear,
  emptyTitle,
  emptyDescription,
  emptyAction,
  toolbar,
  hideExport = true,
  footerLabel = null,
  className,
  selectionMode = false,
  selectedRows,
  onSelectionChange,
  idAccessor,
  errorTitle,
  onPageChange,
  onLimitChange,
}: DataTableWrapperProps<TData>) {
  const data = query.data?.items ?? [];
  const meta = query.data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
  const errorMessage = query.error ? getApiErrorMessage(query.error, errorTitle) : null;

  return (
    <DataFetchShell
      isLoading={query.isLoading}
      error={errorMessage}
      errorTitle={errorTitle}
      onRetry={() => void query.refetch()}
    >
      <DataTableShell
        columns={columns}
        data={data}
        isLoading={query.isFetching && !query.isLoading}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filterChips={filterChips}
        onFilterChipRemove={onFilterChipRemove}
        onFilterChipsClear={onFilterChipsClear}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
        toolbar={toolbar}
        hideExport={hideExport}
        footerLabel={footerLabel}
        className={className}
        selectionMode={selectionMode}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        idAccessor={idAccessor}
      />
      {onPageChange && onLimitChange ? (
        <DataTablePagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      ) : null}
    </DataFetchShell>
  );
}
