import type { TripStatus } from '@/features/trips/types/trip.types';

export type ColumnGroupId = 'draft' | 'pending' | 'assigning' | 'loading' | 'on_route' | 'arrival' | 'completed';

export interface ColumnGroup {
  id: ColumnGroupId;
  statuses: TripStatus[];
  labelKey: string;
}

export const COLUMN_GROUPS: ColumnGroup[] = [
  { id: 'draft', statuses: ['DRAFT'], labelKey: 'dispatch_board.columns.draft' },
  { id: 'pending', statuses: ['PENDING'], labelKey: 'dispatch_board.columns.pending' },
  { id: 'assigning', statuses: ['ASSIGNED', 'DRIVER_CONFIRMED'], labelKey: 'dispatch_board.columns.assigning' },
  { id: 'loading', statuses: ['LOADING'], labelKey: 'dispatch_board.columns.loading' },
  { id: 'on_route', statuses: ['ON_ROUTE'], labelKey: 'dispatch_board.columns.on_route' },
  { id: 'arrival', statuses: ['WAITING', 'UNLOADING'], labelKey: 'dispatch_board.columns.arrival' },
  { id: 'completed', statuses: ['COMPLETED'], labelKey: 'dispatch_board.columns.completed' },
];
