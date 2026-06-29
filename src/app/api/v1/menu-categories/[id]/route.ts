import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { menuCategoryService } from '@/server/modules/menu/menu-category.service';
import { objectIdSchema } from '@/lib/validators/common';
import { menuCategoryUpdateSchema } from '@/lib/validators/menu';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof menuCategoryUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['menu', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await menuCategoryService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['menu', 'edit'],
  paramsSchema,
  bodySchema: menuCategoryUpdateSchema,
  audit: { module: 'menu', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await menuCategoryService.update(
      ctx.params.id,
      ctx.body,
      ctx.user!.id,
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Menu category updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['menu', 'delete'],
  paramsSchema,
  audit: { module: 'menu', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await menuCategoryService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Menu category removed' });
  },
});
