import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getProtectedRoutePrefixes } from '@/constants/navigation';
import { AUTH_ROUTES, ROUTES } from '@/constants/routes';

const REFRESH_COOKIE =
  process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME ?? 'tms_refresh_token';

const PROTECTED_PATHS = getProtectedRoutePrefixes();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshSession = request.cookies.has(REFRESH_COOKIE);
  const isAuthPath = AUTH_ROUTES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !hasRefreshSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.login;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && hasRefreshSession) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = ROUTES.dashboard;
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/trips/:path*',
    '/vehicles/:path*',
    '/drivers/:path*',
    '/clients/:path*',
    '/contracts/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/settings/:path*',
    '/login',
    '/verify-otp',
  ],
};
