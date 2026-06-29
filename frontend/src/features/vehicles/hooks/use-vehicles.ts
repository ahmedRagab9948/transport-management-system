import { QUERY_KEYS } from '@tms/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../services/vehicles.service';
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehiclesQueryParams,
} from '../types/vehicle.types';

export const vehiclesQueryKeys = {
  all: [QUERY_KEYS.VEHICLES] as const,
  list: (params: VehiclesQueryParams) => [...vehiclesQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...vehiclesQueryKeys.all, 'detail', id] as const,
};

export function useVehicles(params: VehiclesQueryParams) {
  return useQuery({
    queryKey: vehiclesQueryKeys.list(params),
    queryFn: () => vehiclesService.getVehicles(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehiclesQueryKeys.detail(id),
    queryFn: () => vehiclesService.getVehicle(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesService.createVehicle(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVehiclePayload) => vehiclesService.updateVehicle(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES, 'summary'] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] }),
      ]);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehiclesService.deleteVehicle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      vehiclesService.updateVehicleStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vehiclesQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES, 'summary'] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}
