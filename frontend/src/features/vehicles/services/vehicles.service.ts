import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  CreateVehiclePayload,
  PaginatedVehiclesResponse,
  UpdateVehiclePayload,
  Vehicle,
  VehiclesQueryParams,
} from '../types/vehicle.types';

function cleanParams(params: VehiclesQueryParams) {
  const cleaned: Record<string, any> = {
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 20),
  };

  if (params.search && params.search.trim()) {
    cleaned.search = params.search.trim();
  }
  if (params.vehicleType) {
    cleaned.vehicleType = params.vehicleType;
  }
  if (params.status) {
    cleaned.status = params.status;
  }
  if (params.availableOnly) {
    cleaned.availableOnly = params.availableOnly;
  }

  return cleaned;
}

export const vehiclesService = {
  async getVehicles(
    params: VehiclesQueryParams,
  ): Promise<PaginatedVehiclesResponse> {
    const response = await apiClient.get('/vehicles', {
      params: cleanParams(params),
    });

    return unwrapApiResponse<PaginatedVehiclesResponse>(response);
  },

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await apiClient.get(`/vehicles/${id}`);
    return unwrapApiResponse<Vehicle>(response);
  },

  async createVehicle(payload: CreateVehiclePayload) {
    const response = await apiClient.post('/vehicles', payload);

    return unwrapApiResponse<Vehicle>(response);
  },

  async updateVehicle(id: string, payload: UpdateVehiclePayload): Promise<Vehicle> {
    const response = await apiClient.patch(`/vehicles/${id}`, payload);
    return unwrapApiResponse<Vehicle>(response);
  },

  async deleteVehicle(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/vehicles/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async updateVehicleStatus(id: string, status: string): Promise<Vehicle> {
    const response = await apiClient.patch(`/vehicles/${id}/status`, { status });
    return unwrapApiResponse<Vehicle>(response);
  },
};