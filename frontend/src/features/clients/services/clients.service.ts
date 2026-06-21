import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  Client,
  ClientStatus,
  ClientsQueryParams,
  CreateClientPayload,
  PaginatedClientsResponse,
  UpdateClientPayload,
} from '../types/client.types';

function cleanParams(params: ClientsQueryParams) {
  const cleaned: Record<string, any> = {
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 20),
  };

  if (params.search && params.search.trim()) {
    cleaned.search = params.search.trim();
  }
  if (params.status) {
    cleaned.status = params.status;
  }

  return cleaned;
}

export const clientsService = {
  async getClients(params: ClientsQueryParams): Promise<PaginatedClientsResponse> {
    const response = await apiClient.get('/clients', {
      params: cleanParams(params),
    });

    return unwrapApiResponse<PaginatedClientsResponse>(response);
  },

  async getClient(id: string): Promise<Client> {
    const response = await apiClient.get(`/clients/${id}`);
    return unwrapApiResponse<Client>(response);
  },

  async createClient(payload: CreateClientPayload) {
    const response = await apiClient.post('/clients', payload);
    return unwrapApiResponse<Client>(response);
  },

  async updateClient(id: string, payload: UpdateClientPayload) {
    const response = await apiClient.patch(`/clients/${id}`, payload);
    return unwrapApiResponse<Client>(response);
  },

  async deleteClient(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/clients/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async updateClientStatus(id: string, status: string): Promise<Client> {
    const response = await apiClient.patch(`/clients/${id}/status`, { status });
    return unwrapApiResponse<Client>(response);
  },
};
