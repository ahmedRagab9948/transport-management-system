import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients.service';
import type {
  ClientsQueryParams,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/client.types';

const CLIENTS_ROOT = ['clients'] as const;

export const clientsQueryKeys = {
  all: CLIENTS_ROOT,
  list: (params: ClientsQueryParams) => [...CLIENTS_ROOT, 'list', params] as const,
  detail: (id: string) => [...CLIENTS_ROOT, 'detail', id] as const,
};

export function useClients(params: ClientsQueryParams) {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => clientsService.getClients(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientsQueryKeys.detail(id),
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsService.createClient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsService.updateClient(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      clientsService.updateClientStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
