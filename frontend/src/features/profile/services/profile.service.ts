import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { ChangePasswordPayload, Profile, UpdateProfilePayload } from '../types/profile.types';

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await apiClient.get('/auth/profile');
    return unwrapApiResponse<Profile>(response);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
    const response = await apiClient.patch('/auth/profile', payload);
    return unwrapApiResponse<Profile>(response);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const response = await apiClient.post('/auth/change-password', payload);
    return unwrapApiResponse<void>(response);
  },
};
