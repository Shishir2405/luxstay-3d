import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { bannerService } from '@/server/modules/content/banner.service';
import {
  bannerCreateSchema,
  bannerListQuerySchema,
  type BannerCreateInput,
  type BannerListQuery,
} from '@/lib/validators/content';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, BannerListQuery>({
  permission: ['banners', 'view'],
  querySchema: bannerListQuerySchema,
  handler: async (ctx) => okPaginated(await bannerService.list(ctx.query)),
});

export const POST = defineRoute<BannerCreateInput>({
  permission: ['banners', 'create'],
  bodySchema: bannerCreateSchema,
  audit: { module: 'banners', action: 'create' },
  handler: async (ctx) => {
    const created = await bannerService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.title, after: created.toJSON() });
    return ok(created, { message: 'Banner created', status: 201 });
  },
});
