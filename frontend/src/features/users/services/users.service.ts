import { apiClient } from '@/services/api-client';
import { unwrapApiResponse } from '@/lib/api/unwrap';
import type { CreateUserPayload, PaginatedUsersResponse, UpdateUserPayload, User, UsersQueryParams, UsersSummary } from '../types/user.types';

function cleanParams(params: UsersQueryParams) {
  const cleaned: Record<string, any> = {
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 20),
  };
  if (params.search && params.search.trim()) cleaned.search = params.search.trim();
  if (params.roleId) cleaned.roleId = params.roleId;
  if (params.isActive !== undefined) cleaned.isActive = params.isActive;
  if (params.sortBy) cleaned.sortBy = params.sortBy;
  if (params.sortOrder) cleaned.sortOrder = params.sortOrder;
  return cleaned;
}

export const usersService = {
  async getUsers(params: UsersQueryParams): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get('/users', { params: cleanParams(params) });
    return unwrapApiResponse<PaginatedUsersResponse>(response);
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return unwrapApiResponse<User>(response);
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post('/users', payload);
    return unwrapApiResponse<User>(response);
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, payload);
    return unwrapApiResponse<User>(response);
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async activateUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/users/${id}/activate`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post(`/users/${id}/reset-password`);
    return unwrapApiResponse<{ temporaryPassword: string }>(response);
  },

  async forceLogout(id: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/users/${id}/force-logout`);
    return unwrapApiResponse<{ message: string }>(response);
  },

  async getSummary(): Promise<UsersSummary> {
    const response = await apiClient.get('/users/summary');
    return unwrapApiResponse<UsersSummary>(response);
  },

  async getRoles(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await apiClient.get('/users/roles');
    return unwrapApiResponse<Array<{ id: string; name: string; description?: string }>>(response);
  },
};
