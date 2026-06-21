import { AuthenticatedUser } from './jwt-payload.interface';

export interface AuthTokensResult {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export interface LoginResult {
  requiresOtp: boolean;
  otpSessionId?: string;
  expiresAt?: Date;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthenticatedUser;
}
