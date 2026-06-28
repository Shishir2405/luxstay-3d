import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { amenityService } from '@/server/modules/amenities/amenity.service';
import { paginationQuerySchema, type PaginationQuery } from '@/lib/validators/common';
import { amenityCreateSchema, type AmenityCreateInput } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, PaginationQuery>({
  permission: ['amenities', 'view'],
  querySchema: paginationQuerySchema,
  handler: async (ctx) => okPaginated(await amenityService.list(ctx.query)),
});

export const POST = defineRoute<AmenityCreateInput>({
  permission: ['amenities', 'create'],
  bodySchema: amenityCreateSchema,
  audit: { module: 'amenities', action: 'create' },
  handler: async (ctx) => {
    const created = await amenityService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Amenity created', status: 201 });
  },
});
