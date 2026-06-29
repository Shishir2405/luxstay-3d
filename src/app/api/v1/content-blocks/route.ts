import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { contentBlockService } from '@/server/modules/content/content-block.service';
import {
  contentBlockCreateSchema,
  contentBlockListQuerySchema,
  type ContentBlockCreateInput,
  type ContentBlockListQuery,
} from '@/lib/validators/content';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, ContentBlockListQuery>({
  permission: ['content', 'view'],
  querySchema: contentBlockListQuerySchema,
  handler: async (ctx) => okPaginated(await contentBlockService.list(ctx.query)),
});

export const POST = defineRoute<ContentBlockCreateInput>({
  permission: ['content', 'create'],
  bodySchema: contentBlockCreateSchema,
  audit: { module: 'content', action: 'create' },
  handler: async (ctx) => {
    const created = await contentBlockService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.key, after: created.toJSON() });
    return ok(created, { message: 'Content block created', status: 201 });
  },
});
