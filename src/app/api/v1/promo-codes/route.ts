import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { promoService } from '@/server/modules/rooms/promo.service';
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validators/common';
import { promoCodeCreateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

type CreateBody = z.infer<typeof promoCodeCreateSchema>;

export const GET = defineRoute<unknown, PaginationQuery>({
  permission: ['promoCodes', 'view'],
  querySchema: paginationQuerySchema,
  handler: async (ctx) => okPaginated(await promoService.list(ctx.query)),
});

export const POST = defineRoute<CreateBody>({
  permission: ['promoCodes', 'create'],
  bodySchema: promoCodeCreateSchema,
  audit: { module: 'promoCodes', action: 'create' },
  handler: async (ctx) => {
    const created = await promoService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.code, after: created.toJSON() });
    return ok(created, { message: 'Promo code created', status: 201 });
  },
});
