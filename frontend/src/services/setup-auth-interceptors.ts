import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';

type AuthInterceptorConfig = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  refreshSession: () => Promise<string>;
  onSessionExpired: () => void;
};

let refreshPromise: Promise<string> | null = null;

/**
 * Paths that the auth interceptor must NEVER retry with a refresh token.
 *
 * Adding a path here prevents:
 * 1. Duplicate refresh attempts when a request on this path already 401s.
 * 2. Recursive retry loops (e.g. refresh itself returns 401 → retry → 401…).
 * 3. Premature handleSessionExpired() calls on best-effort endpoints
 *    like logout, which should be allowed to fail silently.
 *
 * Rules of thumb for adding paths:
 * - Every @Public() route on the backend should be listed here.
 * - Any route whose failure is handled by the caller's catch/finally.
 * - Never remove /auth/refresh from this list.
 */
const AUTH_SKIP_PATHS = ['/auth/login', '/auth/verify-otp', '/auth/resend-otp', '/auth/refresh', '/auth/logout'];

function shouldSkipAuthRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_SKIP_PATHS.some((path) => url.includes(path));
}

export function setupAuthInterceptors(config: AuthInterceptorConfig): () => void {
  const requestInterceptorId = apiClient.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = config.getAccessToken();

      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      return requestConfig;
    },
  );

  const responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        shouldSkipAuthRefresh(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = config.refreshSession().finally(() => {
            refreshPromise = null;
          });
        }

        const accessToken = await refreshPromise;
        config.setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('[Auth interceptor] Refresh failed — calling onSessionExpired', refreshError);
        config.onSessionExpired();
        return Promise.reject(refreshError);
      }
    },
  );

  return () => {
    apiClient.interceptors.request.eject(requestInterceptorId);
    apiClient.interceptors.response.eject(responseInterceptorId);
  };
}
