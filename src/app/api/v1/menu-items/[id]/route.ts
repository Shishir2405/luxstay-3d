import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { menuItemService } from '@/server/modules/menu/menu-item.service';
import { objectIdSchema } from '@/lib/validators/common';
import { menuItemUpdateSchema } from '@/lib/validators/menu';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof menuItemUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['menu', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await menuItemService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['menu', 'edit'],
  paramsSchema,
  bodySchema: menuItemUpdateSchema,
  audit: { module: 'menu', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await menuItemService.update(ctx.params.id, ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Menu item updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['menu', 'delete'],
  paramsSchema,
  audit: { module: 'menu', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await menuItemService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Menu item removed' });
  },
});
