import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { roomUnitService } from '@/server/modules/rooms/room-unit.service';
import { objectIdSchema } from '@/lib/validators/common';
import { roomUnitStatusSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type StatusBody = z.infer<typeof roomUnitStatusSchema>;

export const POST = defineRoute<StatusBody, unknown, Params>({
  permission: ['rooms', 'edit'],
  paramsSchema,
  bodySchema: roomUnitStatusSchema,
  audit: { module: 'rooms', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await roomUnitService.changeStatus(
      ctx.params.id,
      ctx.body.status,
      ctx.body.reason,
      ctx.user!.name,
      ctx.user!.id,
    );
    ctx.audit.record({
      targetId: ctx.params.id,
      before,
      after,
      summary: `Status → ${ctx.body.status}`,
    });
    return ok(after, { message: 'Status updated' });
  },
});
