import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { pricingService } from '@/server/modules/rooms/pricing.service';
import { paginationQuerySchema, objectIdSchema } from '@/lib/validators/common';
import { pricingRuleCreateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const listQuerySchema = paginationQuerySchema.extend({ roomType: objectIdSchema.optional() });
type ListQuery = z.infer<typeof listQuerySchema>;
type CreateBody = z.infer<typeof pricingRuleCreateSchema>;

export const GET = defineRoute<unknown, ListQuery>({
  permission: ['pricing', 'view'],
  querySchema: listQuerySchema,
  handler: async (ctx) => okPaginated(await pricingService.list(ctx.query)),
});

export const POST = defineRoute<CreateBody>({
  permission: ['pricing', 'create'],
  bodySchema: pricingRuleCreateSchema,
  audit: { module: 'pricing', action: 'create' },
  handler: async (ctx) => {
    const created = await pricingService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Pricing rule created', status: 201 });
  },
});
