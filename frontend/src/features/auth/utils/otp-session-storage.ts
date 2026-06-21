import type { OtpSessionState } from '../types/auth.types';

const OTP_SESSION_KEY = 'tms_otp_session';

export const otpSessionStorage = {
  get(): OtpSessionState | null {
    if (typeof window === 'undefined') return null;

    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as OtpSessionState;
    } catch {
      return null;
    }
  },

  set(session: OtpSessionState): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(OTP_SESSION_KEY);
  },
};
