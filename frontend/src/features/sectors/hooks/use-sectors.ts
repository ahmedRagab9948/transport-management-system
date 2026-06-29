import { QUERY_KEYS } from '@tms/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectorsService } from '../services/sectors.service';
import { sectorKeys } from '../constants/sector-query-keys';
import type {
  CreateSectorPayload,
  SectorsQueryParams,
  UpdateSectorPayload,
} from '../types/sector.types';

export function useSectors(params: SectorsQueryParams) {
  return useQuery({
    queryKey: sectorKeys.list(params),
    queryFn: () => sectorsService.getSectors(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useSector(id: string) {
  return useQuery({
    queryKey: sectorKeys.detail(id),
    queryFn: () => sectorsService.getSectorById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateSector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSectorPayload) => sectorsService.createSector(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SECTORS, 'summary'] });
    },
  });
}

export function useUpdateSector(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSectorPayload) => sectorsService.updateSector(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: sectorKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SECTORS, 'summary'] });
    },
  });
}

export function useUpdateSectorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sectorsService.updateSectorStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SECTORS, 'summary'] });
    },
  });
}
