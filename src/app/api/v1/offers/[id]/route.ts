import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { offerService } from '@/server/modules/menu/offer.service';
import { objectIdSchema } from '@/lib/validators/common';
import { offerUpdateSchema } from '@/lib/validators/menu';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof offerUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['offers', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await offerService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['offers', 'edit'],
  paramsSchema,
  bodySchema: offerUpdateSchema,
  audit: { module: 'offers', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await offerService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Offer updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['offers', 'delete'],
  paramsSchema,
  audit: { module: 'offers', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await offerService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Offer removed' });
  },
});
