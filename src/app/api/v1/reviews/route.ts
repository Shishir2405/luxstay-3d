import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { reviewService } from '@/server/modules/customer/review.service';
import {
  reviewCreateSchema,
  reviewListQuerySchema,
  type ReviewCreateInput,
  type ReviewListQuery,
} from '@/lib/validators/customer';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, ReviewListQuery>({
  permission: ['reviews', 'view'],
  querySchema: reviewListQuerySchema,
  handler: async (ctx) => okPaginated(await reviewService.list(ctx.query)),
});

export const POST = defineRoute<ReviewCreateInput>({
  auth: true,
  bodySchema: reviewCreateSchema,
  audit: { module: 'reviews', action: 'create' },
  handler: async (ctx) => {
    const created = await reviewService.create(ctx.body, {
      id: ctx.user!.id,
      name: ctx.user!.name,
    });
    ctx.audit.record({ targetId: created.id, targetLabel: created.title, after: created.toJSON() });
    return ok(created, { message: 'Review submitted for moderation', status: 201 });
  },
});
