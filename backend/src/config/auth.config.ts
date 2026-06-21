import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  refreshCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'tms_refresh_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'strict' | 'lax' | 'none',
  cookiePath: process.env.COOKIE_PATH ?? '/',
}));
