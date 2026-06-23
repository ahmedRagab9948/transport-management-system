import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vehiclesService } from '../services/vehicles.service';
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehiclesQueryParams,
} from '../types/vehicle.types';

export const vehiclesQueryKeys = {
  all: ['vehicles'] as const,
  list: (params: VehiclesQueryParams) => [...vehiclesQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...vehiclesQueryKeys.all, 'detail', id] as const,
};

export function useVehicles(params: VehiclesQueryParams) {
  return useQuery({
    queryKey: vehiclesQueryKeys.list(params),
    queryFn: () => vehiclesService.getVehicles(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
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
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles'] });
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
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['vehicles-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles'] }),
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
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles'] });
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
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles'] });
    },
  });
}
