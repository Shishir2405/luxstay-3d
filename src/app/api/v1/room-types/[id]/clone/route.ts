import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { roomTypeService } from '@/server/modules/rooms/room-type.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const POST = defineRoute<unknown, unknown, Params>({
  permission: ['roomTypes', 'create'],
  paramsSchema,
  audit: { module: 'roomTypes', action: 'create' },
  handler: async (ctx) => {
    const clone = await roomTypeService.clone(ctx.params.id, ctx.user!.id);
    ctx.audit.record({
      targetId: clone.id,
      targetLabel: clone.name,
      summary: `Cloned from ${ctx.params.id}`,
      after: clone.toJSON(),
    });
    return ok(clone, { message: 'Room type cloned as a draft', status: 201 });
  },
});
