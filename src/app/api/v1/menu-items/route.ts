import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { menuItemService } from '@/server/modules/menu/menu-item.service';
import {
  menuItemCreateSchema,
  menuItemListQuerySchema,
  type MenuItemCreateInput,
  type MenuItemListQuery,
} from '@/lib/validators/menu';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, MenuItemListQuery>({
  permission: ['menu', 'view'],
  querySchema: menuItemListQuerySchema,
  handler: async (ctx) => okPaginated(await menuItemService.list(ctx.query)),
});

export const POST = defineRoute<MenuItemCreateInput>({
  permission: ['menu', 'create'],
  bodySchema: menuItemCreateSchema,
  audit: { module: 'menu', action: 'create' },
  handler: async (ctx) => {
    const created = await menuItemService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Menu item created', status: 201 });
  },
});
