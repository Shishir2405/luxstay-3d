import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { menuCategoryService } from '@/server/modules/menu/menu-category.service';
import {
  menuCategoryCreateSchema,
  menuCategoryListQuerySchema,
  type MenuCategoryCreateInput,
  type MenuCategoryListQuery,
} from '@/lib/validators/menu';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, MenuCategoryListQuery>({
  permission: ['menu', 'view'],
  querySchema: menuCategoryListQuerySchema,
  handler: async (ctx) => okPaginated(await menuCategoryService.list(ctx.query)),
});

export const POST = defineRoute<MenuCategoryCreateInput>({
  permission: ['menu', 'create'],
  bodySchema: menuCategoryCreateSchema,
  audit: { module: 'menu', action: 'create' },
  handler: async (ctx) => {
    const created = await menuCategoryService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Menu category created', status: 201 });
  },
});
