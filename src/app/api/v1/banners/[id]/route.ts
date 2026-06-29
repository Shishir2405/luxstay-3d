import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { bannerService } from '@/server/modules/content/banner.service';
import { objectIdSchema } from '@/lib/validators/common';
import { bannerUpdateSchema } from '@/lib/validators/content';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof bannerUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['banners', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await bannerService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['banners', 'edit'],
  paramsSchema,
  bodySchema: bannerUpdateSchema,
  audit: { module: 'banners', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await bannerService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Banner updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['banners', 'delete'],
  paramsSchema,
  audit: { module: 'banners', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await bannerService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Banner removed' });
  },
});
