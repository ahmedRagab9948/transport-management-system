'use client';

import type { FilterChip } from '../filter-chips';

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterChips?: FilterChip[];
  onFilterChipRemove?: (key: string) => void;
  onFilterChipsClear?: () => void;
  toolbar?: React.ReactNode;
  hideExport?: boolean;
}

export function DataTableToolbar(_props: DataTableToolbarProps) {
  return null;
}
