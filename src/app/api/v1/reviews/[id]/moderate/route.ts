import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { reviewService } from '@/server/modules/customer/review.service';
import { objectIdSchema } from '@/lib/validators/common';
import { reviewModerateSchema, type ReviewModerateInput } from '@/lib/validators/customer';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const POST = defineRoute<ReviewModerateInput, unknown, Params>({
  permission: ['reviews', 'edit'],
  paramsSchema,
  bodySchema: reviewModerateSchema,
  audit: { module: 'reviews', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await reviewService.moderate(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Review moderated' });
  },
});
