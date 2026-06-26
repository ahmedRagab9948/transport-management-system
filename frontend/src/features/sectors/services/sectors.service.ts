import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  AssignVehiclePayload,
  CreateSectorPayload,
  CreateSubSectorPayload,
  PaginatedSectorsResponse,
  Sector,
  SectorsQueryParams,
  SubSector,
  TransferVehiclePayload,
  UnassignVehiclePayload,
  UpdateSectorPayload,
  UpdateSubSectorPayload,
  VehicleAssignment,
} from '../types/sector.types';

function cleanSectorParams(params: SectorsQueryParams) {
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

export const sectorsService = {
  async getSectors(params: SectorsQueryParams): Promise<PaginatedSectorsResponse> {
    const response = await apiClient.get('/sectors', {
      params: cleanSectorParams(params),
    });
    return unwrapApiResponse<PaginatedSectorsResponse>(response);
  },

  async getSectorById(id: string): Promise<Sector> {
    const response = await apiClient.get(`/sectors/${id}`);
    return unwrapApiResponse<Sector>(response);
  },

  async createSector(payload: CreateSectorPayload) {
    const response = await apiClient.post('/sectors', payload);
    return unwrapApiResponse<Sector>(response);
  },

  async updateSector(id: string, payload: UpdateSectorPayload) {
    const response = await apiClient.patch(`/sectors/${id}`, payload);
    return unwrapApiResponse<Sector>(response);
  },

  async updateSectorStatus(id: string, status: string): Promise<Sector> {
    const response = await apiClient.patch(`/sectors/${id}/status`, { status });
    return unwrapApiResponse<Sector>(response);
  },

  async getSubSectors(sectorId: string): Promise<SubSector[]> {
    const response = await apiClient.get(`/sectors/${sectorId}/sub-sectors`);
    return unwrapApiResponse<SubSector[]>(response);
  },

  async getSubSectorById(id: string): Promise<SubSector> {
    const response = await apiClient.get(`/sub-sectors/${id}`);
    return unwrapApiResponse<SubSector>(response);
  },

  async createSubSector(sectorId: string, payload: CreateSubSectorPayload) {
    const response = await apiClient.post(`/sectors/${sectorId}/sub-sectors`, payload);
    return unwrapApiResponse<SubSector>(response);
  },

  async updateSubSector(id: string, payload: UpdateSubSectorPayload) {
    const response = await apiClient.patch(`/sub-sectors/${id}`, payload);
    return unwrapApiResponse<SubSector>(response);
  },

  async updateSubSectorStatus(id: string, status: string): Promise<SubSector> {
    const response = await apiClient.patch(`/sub-sectors/${id}/status`, { status });
    return unwrapApiResponse<SubSector>(response);
  },

  async getVehicleAssignment(vehicleId: string): Promise<VehicleAssignment | null> {
    const response = await apiClient.get(`/vehicles/${vehicleId}/assignment`);
    return unwrapApiResponse<VehicleAssignment | null>(response);
  },

  async assignVehicle(vehicleId: string, payload: AssignVehiclePayload) {
    const response = await apiClient.post(`/vehicles/${vehicleId}/assign`, payload);
    return unwrapApiResponse<VehicleAssignment>(response);
  },

  async transferVehicle(vehicleId: string, payload: TransferVehiclePayload) {
    const response = await apiClient.patch(`/vehicles/${vehicleId}/transfer`, payload);
    return unwrapApiResponse<VehicleAssignment>(response);
  },

  async unassignVehicle(vehicleId: string, payload?: UnassignVehiclePayload) {
    const response = await apiClient.post(`/vehicles/${vehicleId}/unassign`, payload ?? {});
    return unwrapApiResponse<void>(response);
  },
};
