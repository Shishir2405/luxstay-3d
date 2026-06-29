import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { wishlistService } from '@/server/modules/customer/wishlist.service';
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validators/common';
import { wishlistAddSchema, type WishlistAddInput } from '@/lib/validators/customer';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, PaginationQuery>({
  auth: true,
  querySchema: paginationQuerySchema,
  handler: async (ctx) => okPaginated(await wishlistService.list(ctx.user!.id, ctx.query)),
});

export const POST = defineRoute<WishlistAddInput>({
  auth: true,
  bodySchema: wishlistAddSchema,
  handler: async (ctx) => {
    const item = await wishlistService.add(ctx.user!.id, ctx.body.roomType);
    return ok(item, { message: 'Added to wishlist', status: 201 });
  },
});
