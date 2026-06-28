import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { amenityService } from '@/server/modules/amenities/amenity.service';
import { objectIdSchema } from '@/lib/validators/common';
import { amenityUpdateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof amenityUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['amenities', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await amenityService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['amenities', 'edit'],
  paramsSchema,
  bodySchema: amenityUpdateSchema,
  audit: { module: 'amenities', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await amenityService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Amenity updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['amenities', 'delete'],
  paramsSchema,
  audit: { module: 'amenities', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await amenityService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Amenity removed' });
  },
});
