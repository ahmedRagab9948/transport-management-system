import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { Settings, UpdateSettingsPayload } from '../types/settings.types';

export const settingsService = {
  async getSettings(): Promise<Settings> {
    const response = await apiClient.get('/settings');
    return unwrapApiResponse<Settings>(response);
  },
  async updateSettings(payload: UpdateSettingsPayload): Promise<Settings> {
    const response = await apiClient.patch('/settings', payload);
    return unwrapApiResponse<Settings>(response);
  },
};
