import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  CreateDriverPayload,
  Driver,
  PaginatedDriversResponse,
  DriversQueryParams,
  UpdateDriverPayload,
} from '../types/driver.types';

function cleanParams(params: DriversQueryParams) {
  const cleaned: Record<string, unknown> = {
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 20),
  };

  if (params.search && params.search.trim()) {
    cleaned.search = params.search.trim();
  }
  if (params.status) {
    cleaned.status = params.status;
  }
  if (params.availableOnly) {
    cleaned.availableOnly = params.availableOnly;
  }

  return cleaned;
}

export const driversService = {
  async getDrivers(params: DriversQueryParams): Promise<PaginatedDriversResponse> {
    const response = await apiClient.get('/drivers', {
      params: cleanParams(params),
    });

    return unwrapApiResponse<PaginatedDriversResponse>(response);
  },

  async getDriver(id: string): Promise<Driver> {
    const response = await apiClient.get(`/drivers/${id}`);
    return unwrapApiResponse<Driver>(response);
  },

  async createDriver(payload: CreateDriverPayload): Promise<Driver> {
    const response = await apiClient.post('/drivers', payload);
    return unwrapApiResponse<Driver>(response);
  },

  async updateDriver(id: string, payload: UpdateDriverPayload): Promise<Driver> {
    const response = await apiClient.patch(`/drivers/${id}`, payload);
    return unwrapApiResponse<Driver>(response);
  },

  async deleteDriver(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/drivers/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async updateDriverStatus(id: string, status: string): Promise<Driver> {
    const response = await apiClient.patch(`/drivers/${id}/status`, { status });
    return unwrapApiResponse<Driver>(response);
  },
};
