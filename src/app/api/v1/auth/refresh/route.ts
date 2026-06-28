import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { setAuthCookies, readRefreshToken } from '@/server/auth/cookies';
import { authService } from '@/server/modules/auth/auth.service';
import { ApiError } from '@/server/utils/api-error';

export const runtime = 'nodejs';

export const POST = defineRoute({
  auth: false,
  handler: async () => {
    const token = readRefreshToken();
    if (!token) throw ApiError.unauthorized('No active session');
    const result = await authService.refresh(token);
    setAuthCookies(result.accessToken, result.refreshToken);
    return ok(result.user, { message: 'Session refreshed' });
  },
});
