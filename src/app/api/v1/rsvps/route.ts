import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { rsvpService } from '@/server/modules/rsvp/rsvp.service';
import {
  rsvpCreateSchema,
  rsvpListQuerySchema,
  type RsvpCreateInput,
  type RsvpListQuery,
} from '@/lib/validators/rsvp';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, RsvpListQuery>({
  permission: ['rsvps', 'view'],
  querySchema: rsvpListQuerySchema,
  handler: async (ctx) => okPaginated(await rsvpService.list(ctx.query)),
});

export const POST = defineRoute<RsvpCreateInput>({
  auth: 'optional',
  bodySchema: rsvpCreateSchema,
  audit: { module: 'rsvps', action: 'create' },
  handler: async (ctx) => {
    const created = await rsvpService.create(ctx.body, ctx.user?.id ?? null);
    ctx.audit.record({
      module: 'rsvps',
      action: 'create',
      targetId: created.id,
      targetLabel: created.code,
      after: created.toJSON(),
    });
    return ok(created, { message: 'RSVP created', status: 201 });
  },
});
