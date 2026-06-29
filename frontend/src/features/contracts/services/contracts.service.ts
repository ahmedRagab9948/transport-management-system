import { DEFAULT_PAGE } from '@tms/shared';
import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  Contract,
  ContractsQueryParams,
  CreateContractPayload,
  PaginatedContractsResponse,
  UpdateContractPayload,
} from '../types/contract.types';

function cleanParams(params: ContractsQueryParams) {
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
  if (params.clientId) {
    cleaned.clientId = params.clientId;
  }

  return cleaned;
}

export const contractsService = {
  async getContracts(params: ContractsQueryParams): Promise<PaginatedContractsResponse> {
    const response = await apiClient.get('/contracts', {
      params: cleanParams(params),
    });

    return unwrapApiResponse<PaginatedContractsResponse>(response);
  },

  async getContract(id: string): Promise<Contract> {
    const response = await apiClient.get(`/contracts/${id}`);
    return unwrapApiResponse<Contract>(response);
  },

  async createContract(payload: CreateContractPayload) {
    const response = await apiClient.post('/contracts', payload);
    return unwrapApiResponse<Contract>(response);
  },

  async updateContract(id: string, payload: UpdateContractPayload) {
    const response = await apiClient.patch(`/contracts/${id}`, payload);
    return unwrapApiResponse<Contract>(response);
  },

  async deleteContract(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/contracts/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async updateContractStatus(id: string, status: string): Promise<Contract> {
    const response = await apiClient.patch(`/contracts/${id}/status`, { status });
    return unwrapApiResponse<Contract>(response);
  },

  async getClients(): Promise<Array<{ id: string; companyName: string }>> {
    const response = await apiClient.get('/clients', {
      params: { page: DEFAULT_PAGE, limit: 99999 },
    });
    const data = unwrapApiResponse<{ items: Array<{ id: string; companyName: string }> }>(response);
    return data.items;
  },
};
