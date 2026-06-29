import { DEFAULT_PAGE, MAX_PAGE_SIZE, QUERY_KEYS } from '@tms/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsService } from '../services/contracts.service';
import type {
  ContractsQueryParams,
  CreateContractPayload,
  UpdateContractPayload,
} from '../types/contract.types';

const CONTRACTS_ROOT = [QUERY_KEYS.CONTRACTS] as const;

export const contractsQueryKeys = {
  all: CONTRACTS_ROOT,
  list: (params: ContractsQueryParams) => [...CONTRACTS_ROOT, 'list', params] as const,
  detail: (id: string) => [...CONTRACTS_ROOT, 'detail', id] as const,
  clients: [...CONTRACTS_ROOT, 'clients'] as const,
};

export function useContracts(params: ContractsQueryParams) {
  return useQuery({
    queryKey: contractsQueryKeys.list(params),
    queryFn: () => contractsService.getContracts(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: contractsQueryKeys.detail(id),
    queryFn: () => contractsService.getContract(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContractPayload) => contractsService.createContract(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: ['contracts-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['contracts', 'clients'] });
    },
  });
}

export function useUpdateContract(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateContractPayload) => contractsService.updateContract(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: ['contracts-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['contracts', 'clients'] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractsService.deleteContract(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: ['contracts-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['contracts', 'clients'] });
    },
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contractsService.updateContractStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contractsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: ['contracts-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['contracts', 'clients'] });
    },
  });
}

export function useClientContracts(clientId: string) {
  return useQuery({
    queryKey: [...CONTRACTS_ROOT, 'by-client', clientId] as const,
    queryFn: () => contractsService.getContracts({ page: DEFAULT_PAGE, limit: MAX_PAGE_SIZE, clientId }),
    enabled: !!clientId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    select: (data) => data.items,
  });
}

export function useContractClients() {
  return useQuery({
    queryKey: contractsQueryKeys.clients,
    queryFn: () => contractsService.getClients(),
    staleTime: 5 * 60 * 1000,
  });
}
