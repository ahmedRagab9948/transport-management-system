import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectorsService } from '../services/sectors.service';
import { sectorKeys } from './sector-query-keys';
import type {
  CreateSubSectorPayload,
  UpdateSubSectorPayload,
} from '../types/sector.types';

export function useSubSectors(sectorId: string) {
  return useQuery({
    queryKey: sectorKeys.subSectors(sectorId),
    queryFn: () => sectorsService.getSubSectors(sectorId),
    enabled: !!sectorId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useSubSector(id: string) {
  return useQuery({
    queryKey: [...sectorKeys.all, 'sub-sector', id] as const,
    queryFn: () => sectorsService.getSubSectorById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateSubSector(sectorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubSectorPayload) =>
      sectorsService.createSubSector(sectorId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.subSectors(sectorId) });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.detail(sectorId) });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
    },
  });
}

export function useUpdateSubSector(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSubSectorPayload) =>
      sectorsService.updateSubSector(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: [...sectorKeys.all, 'sub-sector', id] });
    },
  });
}

export function useUpdateSubSectorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sectorsService.updateSubSectorStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
    },
  });
}
