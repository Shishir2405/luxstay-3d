import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { eventService } from '@/server/modules/events/event.service';
import {
  eventCreateSchema,
  eventListQuerySchema,
  type EventCreateInput,
  type EventListQuery,
} from '@/lib/validators/events';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, EventListQuery>({
  permission: ['events', 'view'],
  querySchema: eventListQuerySchema,
  handler: async (ctx) => okPaginated(await eventService.list(ctx.query)),
});

export const POST = defineRoute<EventCreateInput>({
  permission: ['events', 'create'],
  bodySchema: eventCreateSchema,
  audit: { module: 'events', action: 'create' },
  handler: async (ctx) => {
    const created = await eventService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.title, after: created.toJSON() });
    return ok(created, { message: 'Event created', status: 201 });
  },
});
