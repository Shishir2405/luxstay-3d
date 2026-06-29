import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { seoService } from '@/server/modules/content/seo.service';
import { objectIdSchema } from '@/lib/validators/common';
import { seoUpdateSchema } from '@/lib/validators/content';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof seoUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['seo', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await seoService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['seo', 'edit'],
  paramsSchema,
  bodySchema: seoUpdateSchema,
  audit: { module: 'seo', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await seoService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'SEO metadata updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['seo', 'delete'],
  paramsSchema,
  audit: { module: 'seo', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await seoService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'SEO metadata removed' });
  },
});
