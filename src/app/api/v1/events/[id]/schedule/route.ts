import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { eventService } from '@/server/modules/events/event.service';
import { objectIdSchema } from '@/lib/validators/common';
import { eventScheduleCreateSchema, type EventScheduleCreateInput } from '@/lib/validators/events';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['events', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await eventService.listSchedule(ctx.params.id)),
});

export const POST = defineRoute<EventScheduleCreateInput, unknown, Params>({
  permission: ['events', 'edit'],
  paramsSchema,
  bodySchema: eventScheduleCreateSchema,
  audit: { module: 'events', action: 'update' },
  handler: async (ctx) => {
    const created = await eventService.addScheduleEntry(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({
      targetId: created.id,
      targetLabel: created.performer,
      after: created.toJSON(),
    });
    return ok(created, { message: 'Schedule entry added', status: 201 });
  },
});
