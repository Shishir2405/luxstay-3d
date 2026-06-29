import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { tableService } from '@/server/modules/rsvp/table.service';
import { objectIdSchema } from '@/lib/validators/common';
import { tableUpdateSchema } from '@/lib/validators/rsvp';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof tableUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['tables', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await tableService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['tables', 'edit'],
  paramsSchema,
  bodySchema: tableUpdateSchema,
  audit: { module: 'tables', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await tableService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Table updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['tables', 'delete'],
  paramsSchema,
  audit: { module: 'tables', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await tableService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Table removed' });
  },
});
