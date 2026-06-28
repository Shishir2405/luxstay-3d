import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { roomTypeService } from '@/server/modules/rooms/room-type.service';
import { objectIdSchema } from '@/lib/validators/common';
import { roomTypeUpdateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof roomTypeUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['roomTypes', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await roomTypeService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['roomTypes', 'edit'],
  paramsSchema,
  bodySchema: roomTypeUpdateSchema,
  audit: { module: 'roomTypes', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await roomTypeService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Room type updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['roomTypes', 'delete'],
  paramsSchema,
  audit: { module: 'roomTypes', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await roomTypeService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Room type removed' });
  },
});
