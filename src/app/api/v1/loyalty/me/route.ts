import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { loyaltyService } from '@/server/modules/customer/loyalty.service';
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validators/common';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, PaginationQuery>({
  auth: true,
  querySchema: paginationQuerySchema,
  handler: async (ctx) => {
    const userId = ctx.user!.id;
    const [balance, transactions] = await Promise.all([
      loyaltyService.balance(userId),
      loyaltyService.transactions(userId, ctx.query),
    ]);
    return ok({ balance, transactions: transactions.items }, { meta: transactions.meta });
  },
});
