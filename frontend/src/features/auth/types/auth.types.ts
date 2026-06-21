import type { PermissionKey } from '@/constants/permissions';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresOtp: boolean;
  otpSessionId?: string;
  expiresAt?: string;
  accessToken?: string;
  user?: AuthUser;
}

export interface VerifyOtpPayload {
  otpSessionId: string;
  code: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  user: AuthUser;
}

export interface OtpSessionState {
  otpSessionId: string;
  expiresAt: string;
  email?: string;
}
