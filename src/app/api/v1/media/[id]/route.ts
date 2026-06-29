import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { mediaService } from '@/server/modules/content/media.service';
import { objectIdSchema } from '@/lib/validators/common';
import { mediaUpdateSchema } from '@/lib/validators/content';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof mediaUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['media', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await mediaService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['media', 'edit'],
  paramsSchema,
  bodySchema: mediaUpdateSchema,
  audit: { module: 'media', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await mediaService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Media asset updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['media', 'delete'],
  paramsSchema,
  audit: { module: 'media', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await mediaService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Media asset removed' });
  },
});
