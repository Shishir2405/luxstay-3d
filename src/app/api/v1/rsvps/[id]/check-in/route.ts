import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { rsvpService } from '@/server/modules/rsvp/rsvp.service';
import { objectIdSchema } from '@/lib/validators/common';
import { rsvpCheckInSchema, type RsvpCheckInInput } from '@/lib/validators/rsvp';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const POST = defineRoute<RsvpCheckInInput, unknown, Params>({
  permission: ['rsvps', 'edit'],
  paramsSchema,
  bodySchema: rsvpCheckInSchema,
  audit: { module: 'rsvps', action: 'check-in' },
  handler: async (ctx) => {
    const actorName = ctx.user?.name ?? ctx.user?.email ?? 'Staff';
    const { before, after } = await rsvpService.checkIn(
      ctx.params.id,
      actorName,
      ctx.user!.id,
      ctx.body.method,
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after, summary: 'Guest checked in' });
    return ok(after, { message: 'Guest checked in' });
  },
});
