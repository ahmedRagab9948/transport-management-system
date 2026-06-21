import { unwrapApiResponse } from '@/lib/api/unwrap';
import { apiClient } from '@/services/api-client';
import type {
  AuthSessionResponse,
  AuthUser,
  LoginPayload,
  LoginResponse,
  VerifyOtpPayload,
} from '../types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', payload);
    return unwrapApiResponse<LoginResponse>(response);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthSessionResponse> {
    const response = await apiClient.post('/auth/verify-otp', payload);
    return unwrapApiResponse<AuthSessionResponse>(response);
  },

  async resendOtp(otpSessionId: string): Promise<{ otpSessionId: string; expiresAt: string }> {
    const response = await apiClient.post('/auth/resend-otp', { otpSessionId });
    return unwrapApiResponse(response);
  },

  async refresh(): Promise<AuthSessionResponse> {
    const response = await apiClient.post('/auth/refresh');
    return unwrapApiResponse<AuthSessionResponse>(response);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get('/auth/me');
    return unwrapApiResponse<AuthUser>(response);
  },
};
