import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { reviewService } from '@/server/modules/customer/review.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['reviews', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await reviewService.getById(ctx.params.id)),
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['reviews', 'delete'],
  paramsSchema,
  audit: { module: 'reviews', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await reviewService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Review removed' });
  },
});
