import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { roomTypeService } from '@/server/modules/rooms/room-type.service';
import { roomTypeCreateSchema, roomTypeListQuerySchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

type ListQuery = z.infer<typeof roomTypeListQuerySchema>;
type CreateBody = z.infer<typeof roomTypeCreateSchema>;

export const GET = defineRoute<unknown, ListQuery>({
  permission: ['roomTypes', 'view'],
  querySchema: roomTypeListQuerySchema,
  handler: async (ctx) => {
    const result = await roomTypeService.list({
      page: ctx.query.page,
      limit: ctx.query.limit,
      search: ctx.query.search,
      sortBy: ctx.query.sortBy,
      sortDir: ctx.query.sortDir,
      isActive: ctx.query.isActive === undefined ? undefined : ctx.query.isActive === 'true',
      isFeatured: ctx.query.isFeatured === undefined ? undefined : ctx.query.isFeatured === 'true',
    });
    return okPaginated(result);
  },
});

export const POST = defineRoute<CreateBody>({
  permission: ['roomTypes', 'create'],
  bodySchema: roomTypeCreateSchema,
  audit: { module: 'roomTypes', action: 'create' },
  handler: async (ctx) => {
    const created = await roomTypeService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Room type created', status: 201 });
  },
});
