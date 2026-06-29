import { DEFAULT_PAGE } from '@tms/shared';
import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';

import type {
  CreateTripPayload,
  PaginatedTripsResponse,
  Trip,
  TripsQueryParams,
  UpdateTripPayload,
} from '../types/trip.types';

function cleanParams(params: TripsQueryParams) {
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
  if (params.activeOnly) {
    cleaned.activeOnly = params.activeOnly;
  }
  if (params.clientId) {
    cleaned.clientId = params.clientId;
  }
  if (params.driverId) {
    cleaned.driverId = params.driverId;
  }
  if (params.vehicleId) {
    cleaned.vehicleId = params.vehicleId;
  }
  if (params.dateFrom) {
    cleaned.dateFrom = params.dateFrom;
  }
  if (params.dateTo) {
    cleaned.dateTo = params.dateTo;
  }

  return cleaned;
}

export const tripsService = {
  async getTrips(params: TripsQueryParams): Promise<PaginatedTripsResponse> {
    const response = await apiClient.get('/trips', {
      params: cleanParams(params),
    });

    return unwrapApiResponse<PaginatedTripsResponse>(response);
  },

  async getTrip(id: string): Promise<Trip> {
    const response = await apiClient.get(`/trips/${id}`);
    return unwrapApiResponse<Trip>(response);
  },

  async createTrip(payload: CreateTripPayload) {
    const response = await apiClient.post('/trips', payload);
    return unwrapApiResponse<Trip>(response);
  },

  async updateTrip(id: string, payload: UpdateTripPayload) {
    const response = await apiClient.patch(`/trips/${id}`, payload);
    return unwrapApiResponse<Trip>(response);
  },

  async deleteTrip(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/trips/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async updateTripStatus(id: string, payload: { status: string; notes?: string; reasonCode?: string; actualEndDate?: string }): Promise<Trip> {
    const response = await apiClient.patch(`/trips/${id}/status`, payload);
    return unwrapApiResponse<Trip>(response);
  },

  async getVehicles(): Promise<Array<{ id: string; vehicleCode: string }>> {
    const response = await apiClient.get('/vehicles', {
      params: { page: DEFAULT_PAGE, limit: 99999 },
    });
    const data = unwrapApiResponse<{ items: Array<{ id: string; vehicleCode: string }> }>(response);
    return data.items;
  },

  async getDrivers(): Promise<Array<{ id: string; fullName: string; driverCode?: string }>> {
    const response = await apiClient.get('/drivers', {
      params: { page: DEFAULT_PAGE, limit: 99999 },
    });
    const data = unwrapApiResponse<{ items: Array<{ id: string; fullName: string; driverCode?: string }> }>(response);
    return data.items;
  },

  async getClients(): Promise<Array<{ id: string; companyName: string }>> {
    const response = await apiClient.get('/clients', {
      params: { page: DEFAULT_PAGE, limit: 99999 },
    });
    const data = unwrapApiResponse<{ items: Array<{ id: string; companyName: string }> }>(response);
    return data.items;
  },
};
