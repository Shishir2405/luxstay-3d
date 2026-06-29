import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { eventService } from '@/server/modules/events/event.service';
import { objectIdSchema } from '@/lib/validators/common';
import { eventUpdateSchema } from '@/lib/validators/events';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof eventUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['events', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await eventService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['events', 'edit'],
  paramsSchema,
  bodySchema: eventUpdateSchema,
  audit: { module: 'events', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await eventService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Event updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['events', 'delete'],
  paramsSchema,
  audit: { module: 'events', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await eventService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Event removed' });
  },
});
