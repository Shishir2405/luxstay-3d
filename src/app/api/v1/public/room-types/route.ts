import { defineRoute } from '@/server/http/define-route';
import { okPaginated } from '@/server/http/respond';
import { roomTypeService } from '@/server/modules/rooms/room-type.service';
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validators/common';

export const runtime = 'nodejs';

// Public storefront: lists ACTIVE room types only, no auth.
export const GET = defineRoute<unknown, PaginationQuery>({
  auth: false,
  querySchema: paginationQuerySchema,
  handler: async (ctx) =>
    okPaginated(
      await roomTypeService.list({
        page: ctx.query.page,
        limit: ctx.query.limit,
        search: ctx.query.search,
        sortBy: ctx.query.sortBy,
        sortDir: ctx.query.sortDir,
        isActive: true,
      }),
    ),
});
