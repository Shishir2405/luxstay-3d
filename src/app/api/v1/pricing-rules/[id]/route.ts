import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { pricingService } from '@/server/modules/rooms/pricing.service';
import { objectIdSchema } from '@/lib/validators/common';
import { pricingRuleUpdateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof pricingRuleUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['pricing', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await pricingService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['pricing', 'edit'],
  paramsSchema,
  bodySchema: pricingRuleUpdateSchema,
  audit: { module: 'pricing', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await pricingService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Pricing rule updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['pricing', 'delete'],
  paramsSchema,
  audit: { module: 'pricing', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await pricingService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Pricing rule removed' });
  },
});
