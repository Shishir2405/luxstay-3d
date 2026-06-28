import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';

export const runtime = 'nodejs';

/** Returns the current session principal (used to bootstrap the client auth store). */
export const GET = defineRoute({
  auth: true,
  handler: async (ctx) => ok(ctx.user, { message: 'Authenticated' }),
});
