import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { cookies } from 'next/headers';

const REFRESH_COOKIE =
  process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME ?? 'tms_refresh_token';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(REFRESH_COOKIE);

  redirect(hasSession ? ROUTES.dashboard : ROUTES.login);
}
