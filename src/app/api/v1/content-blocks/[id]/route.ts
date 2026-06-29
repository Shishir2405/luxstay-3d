import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { contentBlockService } from '@/server/modules/content/content-block.service';
import { objectIdSchema } from '@/lib/validators/common';
import { contentBlockUpdateSchema } from '@/lib/validators/content';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof contentBlockUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['content', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await contentBlockService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['content', 'edit'],
  paramsSchema,
  bodySchema: contentBlockUpdateSchema,
  audit: { module: 'content', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await contentBlockService.update(
      ctx.params.id,
      ctx.body,
      ctx.user!.id,
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Content block updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['content', 'delete'],
  paramsSchema,
  audit: { module: 'content', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await contentBlockService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Content block removed' });
  },
});
