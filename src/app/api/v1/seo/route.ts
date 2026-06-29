import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { seoService } from '@/server/modules/content/seo.service';
import {
  seoCreateSchema,
  seoListQuerySchema,
  type SeoCreateInput,
  type SeoListQuery,
} from '@/lib/validators/content';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, SeoListQuery>({
  permission: ['seo', 'view'],
  querySchema: seoListQuerySchema,
  handler: async (ctx) => okPaginated(await seoService.list(ctx.query)),
});

export const POST = defineRoute<SeoCreateInput>({
  permission: ['seo', 'create'],
  bodySchema: seoCreateSchema,
  audit: { module: 'seo', action: 'create' },
  handler: async (ctx) => {
    const created = await seoService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.path, after: created.toJSON() });
    return ok(created, { message: 'SEO metadata created', status: 201 });
  },
});
