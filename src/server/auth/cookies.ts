import 'server-only';
import { cookies } from 'next/headers';
import { env } from '@/server/config/env';

export const ACCESS_COOKIE = 'luxstay_at';
export const REFRESH_COOKIE = 'luxstay_rt';

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function baseOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax' as const,
    path: '/',
  };
}

/** Sets both auth cookies on the outgoing response (route-handler context). */
export function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...baseOptions(), maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions(), maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies() {
  const store = cookies();
  store.set(ACCESS_COOKIE, '', { ...baseOptions(), maxAge: 0 });
  store.set(REFRESH_COOKIE, '', { ...baseOptions(), maxAge: 0 });
}

export function readAccessToken(): string | undefined {
  return cookies().get(ACCESS_COOKIE)?.value;
}

export function readRefreshToken(): string | undefined {
  return cookies().get(REFRESH_COOKIE)?.value;
}
