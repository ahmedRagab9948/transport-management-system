import { QUERY_KEYS } from '@tms/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driversService } from '../services/drivers.service';
import type {
  CreateDriverPayload,
  DriversQueryParams,
  UpdateDriverPayload,
} from '../types/driver.types';

export const driversQueryKeys = {
  all: [QUERY_KEYS.DRIVERS] as const,
  list: (params: DriversQueryParams) => [...driversQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...driversQueryKeys.all, 'detail', id] as const,
};

export function useDrivers(params: DriversQueryParams) {
  return useQuery({
    queryKey: driversQueryKeys.list(params),
    queryFn: () => driversService.getDrivers(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: driversQueryKeys.detail(id),
    queryFn: () => driversService.getDriver(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driversService.createDriver(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: driversQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.DRIVERS] });
    },
  });
}

export function useUpdateDriver(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDriverPayload) => driversService.updateDriver(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: driversQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: driversQueryKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS, 'summary'] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.DRIVERS] }),
      ]);
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driversService.deleteDriver(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: driversQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.DRIVERS] });
    },
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      driversService.updateDriverStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: driversQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DRIVERS, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.DRIVERS] });
    },
  });
}
