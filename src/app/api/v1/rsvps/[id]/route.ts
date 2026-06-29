import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { rsvpService } from '@/server/modules/rsvp/rsvp.service';
import { objectIdSchema } from '@/lib/validators/common';
import { rsvpUpdateSchema } from '@/lib/validators/rsvp';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof rsvpUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['rsvps', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await rsvpService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['rsvps', 'edit'],
  paramsSchema,
  bodySchema: rsvpUpdateSchema,
  audit: { module: 'rsvps', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await rsvpService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'RSVP updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['rsvps', 'delete'],
  paramsSchema,
  audit: { module: 'rsvps', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await rsvpService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'RSVP removed' });
  },
});
