'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { PermissionKey } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { setupAuthInterceptors } from '@/services/setup-auth-interceptors';
import { authService } from '../services/auth.service';
import type { AuthUser, LoginPayload, LoginResponse, VerifyOtpPayload } from '../types/auth.types';
import { otpSessionStorage } from '../utils/otp-session-storage';
import { tokenStorage } from '../utils/token-storage';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  resendOtp: (otpSessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  hasPermission: (permission: PermissionKey | PermissionKey[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(accessToken: string, user: AuthUser) {
  tokenStorage.set(accessToken);
  return user;
}

const BOOTSTRAP_TIMEOUT_MS = 30_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    otpSessionStorage.clear();
    setUser(null);
  }, []);

  const handleSessionExpired = useCallback(() => {
    console.warn('[Auth] Session expired — clearing session and redirecting to login');
    clearSession();
    const currentPath = window.location.pathname;
    const redirect = currentPath !== ROUTES.login ? `?redirect=${encodeURIComponent(currentPath)}` : '';
    router.replace(`${ROUTES.login}${redirect}`);
  }, [clearSession, router]);

  const establishSession = useCallback((accessToken: string, sessionUser: AuthUser) => {
    applySession(accessToken, sessionUser);
    setUser(sessionUser);
  }, []);

  const refreshSession = useCallback(async (): Promise<string> => {
    const result = await authService.refresh();
    establishSession(result.accessToken, result.user);
    return result.accessToken;
  }, [establishSession]);

  useEffect(() => {
    const cleanup = setupAuthInterceptors({
      getAccessToken: () => tokenStorage.get(),
      setAccessToken: (token) => tokenStorage.set(token),
      refreshSession,
      onSessionExpired: handleSessionExpired,
    });
    return cleanup;
  }, [refreshSession, handleSessionExpired]);

  useEffect(() => {
    let mounted = true;
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.error('[Auth] SAFETY: Bootstrap exceeded', BOOTSTRAP_TIMEOUT_MS, 'ms — forcing isLoading=false');
        setIsLoading(false);
      }
    }, BOOTSTRAP_TIMEOUT_MS);

    async function bootstrap() {
      const existingToken = tokenStorage.get();

      try {
        if (existingToken) {
          const profile = await authService.getMe();
          if (mounted) setUser(profile);
        } else {
          const refreshed = await authService.refresh();
          if (mounted) establishSession(refreshed.accessToken, refreshed.user);
        }
      } catch (error) {
        console.warn('[Auth] Bootstrap failed — clearing session and cleaning up cookie', error);
        if (mounted) clearSession();
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('[Auth] Logout call during bootstrap cleanup failed', logoutError);
        }
      } finally {
        if (mounted) setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, [clearSession, establishSession]);

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResponse> => {
    const result = await authService.login(payload);

    if (result.requiresOtp && result.otpSessionId) {
      otpSessionStorage.set({
        otpSessionId: result.otpSessionId,
        expiresAt: result.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        email: payload.email,
      });
      return result;
    }

    if (result.accessToken && result.user) {
      establishSession(result.accessToken, result.user);
      otpSessionStorage.clear();
    }

    return result;
  }, [establishSession]);

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      const result = await authService.verifyOtp(payload);
      establishSession(result.accessToken, result.user);
      otpSessionStorage.clear();
    },
    [establishSession],
  );

  const resendOtp = useCallback(async (otpSessionId: string) => {
    const result = await authService.resendOtp(otpSessionId);
    const current = otpSessionStorage.get();

    otpSessionStorage.set({
      otpSessionId: result.otpSessionId,
      expiresAt: result.expiresAt,
      email: current?.email,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* best-effort — session cleared in finally */
    } finally {
      clearSession();
      router.replace(ROUTES.login);
    }
  }, [clearSession, router]);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } catch {
      /* best-effort — session cleared in finally */
    } finally {
      clearSession();
      router.replace(ROUTES.login);
    }
  }, [clearSession, router]);

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getMe();
    setUser(profile);
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionKey | PermissionKey[]) => {
      if (!user) return false;
      const keys = Array.isArray(permission) ? permission : [permission];
      return keys.every((key) => user.permissions.includes(key));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStorage.get()),
      isLoading,
      login,
      verifyOtp,
      resendOtp,
      logout,
      logoutAll,
      hasPermission,
      refreshProfile,
    }),
    [
      user,
      isLoading,
      login,
      verifyOtp,
      resendOtp,
      logout,
      logoutAll,
      hasPermission,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
