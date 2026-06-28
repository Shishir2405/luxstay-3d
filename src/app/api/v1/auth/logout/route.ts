import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { clearAuthCookies } from '@/server/auth/cookies';

export const runtime = 'nodejs';

export const POST = defineRoute({
  auth: 'optional',
  handler: async (ctx) => {
    if (ctx.user) {
      ctx.audit.record({
        module: 'auth',
        action: 'logout',
        targetId: ctx.user.id,
        summary: 'Signed out',
      });
    }
    clearAuthCookies();
    return ok(null, { message: 'Signed out' });
  },
});
