import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { setAuthCookies } from '@/server/auth/cookies';
import { authService } from '@/server/modules/auth/auth.service';
import { registerSchema, type RegisterInput } from '@/lib/validators';

export const runtime = 'nodejs';

export const POST = defineRoute<RegisterInput>({
  auth: false,
  bodySchema: registerSchema,
  rateLimit: { key: 'register', limit: 6, windowMs: 10 * 60_000 },
  audit: { module: 'auth', action: 'create' },
  handler: async (ctx) => {
    const result = await authService.register(ctx.body);
    setAuthCookies(result.accessToken, result.refreshToken);
    ctx.audit.record({ targetId: result.user.id, summary: `Registered ${result.user.email}` });
    return ok(result.user, { message: 'Welcome to LuxStay', status: 201 });
  },
});
