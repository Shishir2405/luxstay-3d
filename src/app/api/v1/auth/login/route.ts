import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { setAuthCookies } from '@/server/auth/cookies';
import { authService } from '@/server/modules/auth/auth.service';
import { loginSchema, type LoginInput } from '@/lib/validators';

export const runtime = 'nodejs';

export const POST = defineRoute<LoginInput>({
  auth: false,
  bodySchema: loginSchema,
  // Throttle credential stuffing: 8 attempts / 5 min / IP.
  rateLimit: { key: 'login', limit: 8, windowMs: 5 * 60_000 },
  audit: { module: 'auth', action: 'login' },
  handler: async (ctx) => {
    const result = await authService.login(ctx.body.email, ctx.body.password, ctx.body.totp);
    setAuthCookies(result.accessToken, result.refreshToken);
    ctx.audit.record({ targetId: result.user.id, summary: `Signed in` });
    return ok(result.user, { message: 'Signed in successfully' });
  },
});
