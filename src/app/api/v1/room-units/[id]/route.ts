import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { roomUnitService } from '@/server/modules/rooms/room-unit.service';
import { objectIdSchema } from '@/lib/validators/common';
import { roomUnitUpdateSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof roomUnitUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['rooms', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await roomUnitService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['rooms', 'edit'],
  paramsSchema,
  bodySchema: roomUnitUpdateSchema,
  audit: { module: 'rooms', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await roomUnitService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Room unit updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['rooms', 'delete'],
  paramsSchema,
  audit: { module: 'rooms', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await roomUnitService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Room unit removed' });
  },
});
