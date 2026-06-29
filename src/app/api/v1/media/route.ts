import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { mediaService } from '@/server/modules/content/media.service';
import {
  mediaCreateSchema,
  mediaListQuerySchema,
  type MediaCreateInput,
  type MediaListQuery,
} from '@/lib/validators/content';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, MediaListQuery>({
  permission: ['media', 'view'],
  querySchema: mediaListQuerySchema,
  handler: async (ctx) => okPaginated(await mediaService.list(ctx.query)),
});

export const POST = defineRoute<MediaCreateInput>({
  permission: ['media', 'create'],
  bodySchema: mediaCreateSchema,
  audit: { module: 'media', action: 'create' },
  handler: async (ctx) => {
    const created = await mediaService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.title, after: created.toJSON() });
    return ok(created, { message: 'Media asset created', status: 201 });
  },
});
