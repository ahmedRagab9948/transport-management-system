'use client';

import { QUERY_KEYS } from '@tms/shared';
import { useQuery } from '@tanstack/react-query';
import { dispatchBoardService } from '../services/dispatch-board.service';

const DISPATCH_ROOT = [QUERY_KEYS.DISPATCH_BOARD] as const;

export const dispatchQueryKeys = {
  all: DISPATCH_ROOT,
  stats: [...DISPATCH_ROOT, 'stats'] as const,
  trips: (includeCancelled: boolean) => [...DISPATCH_ROOT, 'trips', { includeCancelled }] as const,
  trip: (id: string) => [...DISPATCH_ROOT, 'trip', id] as const,
  resources: [...DISPATCH_ROOT, 'resources'] as const,
};

const STALE_TIMES = {
  stats: 15 * 1000,
  trips: 10 * 1000,
  resources: 30 * 1000,
};

export function useDispatchBoardStats() {
  return useQuery({
    queryKey: dispatchQueryKeys.stats,
    queryFn: () => dispatchBoardService.getStats(),
    staleTime: STALE_TIMES.stats,
  });
}

export function useDispatchBoardTrips(includeCancelled = false) {
  return useQuery({
    queryKey: dispatchQueryKeys.trips(includeCancelled),
    queryFn: () => dispatchBoardService.getTrips(includeCancelled),
    staleTime: STALE_TIMES.trips,
  });
}

export function useDispatchBoardTrip(id: string) {
  return useQuery({
    queryKey: dispatchQueryKeys.trip(id),
    queryFn: () => dispatchBoardService.getTrip(id),
    enabled: !!id,
    staleTime: STALE_TIMES.trips,
  });
}

export function useDispatchResources() {
  return useQuery({
    queryKey: dispatchQueryKeys.resources,
    queryFn: () => dispatchBoardService.getResources(),
    staleTime: STALE_TIMES.resources,
  });
}
