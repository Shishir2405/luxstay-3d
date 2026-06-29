import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { offerService } from '@/server/modules/menu/offer.service';
import {
  offerCreateSchema,
  offerListQuerySchema,
  type OfferCreateInput,
  type OfferListQuery,
} from '@/lib/validators/menu';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, OfferListQuery>({
  permission: ['offers', 'view'],
  querySchema: offerListQuerySchema,
  handler: async (ctx) => okPaginated(await offerService.list(ctx.query)),
});

export const POST = defineRoute<OfferCreateInput>({
  permission: ['offers', 'create'],
  bodySchema: offerCreateSchema,
  audit: { module: 'offers', action: 'create' },
  handler: async (ctx) => {
    const created = await offerService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.title, after: created.toJSON() });
    return ok(created, { message: 'Offer created', status: 201 });
  },
});
