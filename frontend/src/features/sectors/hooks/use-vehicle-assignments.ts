import { QUERY_KEYS } from '@tms/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectorsService } from '../services/sectors.service';
import { sectorKeys } from '../constants/sector-query-keys';
import type {
  AssignVehiclePayload,
  TransferVehiclePayload,
  UnassignVehiclePayload,
  VehicleAssignmentHistory,
} from '../types/sector.types';

export function useVehicleAssignment(vehicleId: string) {
  return useQuery({
    queryKey: sectorKeys.assignment(vehicleId),
    queryFn: () => sectorsService.getVehicleAssignment(vehicleId),
    enabled: !!vehicleId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAssignVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload: AssignVehiclePayload }) =>
      sectorsService.assignVehicle(vehicleId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.assignments() });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}

export function useTransferVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload: TransferVehiclePayload }) =>
      sectorsService.transferVehicle(vehicleId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.assignments() });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}

export function useUnassignVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, payload }: { vehicleId: string; payload?: UnassignVehiclePayload }) =>
      sectorsService.unassignVehicle(vehicleId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.assignments() });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VEHICLES] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRIPS, QUERY_KEYS.VEHICLES] });
    },
  });
}

// TODO: Sprint 4 — implement when backend endpoint is available
export function useVehicleAssignmentHistory(_vehicleId: string) {
  return useQuery<VehicleAssignmentHistory[]>({
    queryKey: sectorKeys.assignmentHistory(_vehicleId),
    queryFn: () => Promise.resolve([] as VehicleAssignmentHistory[]),
    enabled: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
