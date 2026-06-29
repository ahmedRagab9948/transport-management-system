import { STORAGE_KEYS } from '@tms/shared';
import type { OtpSessionState } from '../types/auth.types';

export const otpSessionStorage = {
  get(): OtpSessionState | null {
    if (typeof window === 'undefined') return null;

    const raw = sessionStorage.getItem(STORAGE_KEYS.OTP_SESSION);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as OtpSessionState;
    } catch {
      return null;
    }
  },

  set(session: OtpSessionState): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEYS.OTP_SESSION, JSON.stringify(session));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEYS.OTP_SESSION);
  },
};
