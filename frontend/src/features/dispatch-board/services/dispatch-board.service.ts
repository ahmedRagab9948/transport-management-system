import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { DispatchBoardResponse, DispatchBoardStats, DispatchBoardTrip, AvailableResourcesResponse } from '../types/dispatch-board.types';

export const dispatchBoardService = {
  async getStats(): Promise<DispatchBoardStats> {
    const response = await apiClient.get('/dispatch-board/stats');
    return unwrapApiResponse<DispatchBoardStats>(response);
  },

  async getTrips(includeCancelled = false): Promise<DispatchBoardResponse> {
    const response = await apiClient.get('/dispatch-board/trips', {
      params: includeCancelled ? { includeCancelled: 'true' } : undefined,
    });
    return unwrapApiResponse<DispatchBoardResponse>(response);
  },

  async getTrip(id: string): Promise<DispatchBoardTrip> {
    const response = await apiClient.get(`/dispatch-board/trips/${id}`);
    return unwrapApiResponse<DispatchBoardTrip>(response);
  },

  async getResources(): Promise<AvailableResourcesResponse> {
    const response = await apiClient.get('/dispatch-board/resources');
    return unwrapApiResponse<AvailableResourcesResponse>(response);
  },
};
