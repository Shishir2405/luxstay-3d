import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { availabilityService } from '@/server/modules/rooms/availability.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

/** Admin: lift a previously-placed block. */
export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['rooms', 'edit'],
  paramsSchema,
  audit: { module: 'rooms', action: 'update' },
  handler: async (ctx) => {
    await availabilityService.releaseBlock(ctx.params.id);
    ctx.audit.record({ targetId: ctx.params.id, summary: 'Released availability block' });
    return ok(null, { message: 'Block released' });
  },
});
