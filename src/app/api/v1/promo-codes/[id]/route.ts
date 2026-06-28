import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { promoService } from '@/server/modules/rooms/promo.service';
import { objectIdSchema } from '@/lib/validators/common';
import { promoCodeUpdateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof promoCodeUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['promoCodes', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await promoService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['promoCodes', 'edit'],
  paramsSchema,
  bodySchema: promoCodeUpdateSchema,
  audit: { module: 'promoCodes', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await promoService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Promo code updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['promoCodes', 'delete'],
  paramsSchema,
  audit: { module: 'promoCodes', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await promoService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Promo code removed' });
  },
});
