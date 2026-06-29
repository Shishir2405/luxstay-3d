import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { notificationTemplateService } from '@/server/modules/email/notification-template.service';
import {
  templateCreateSchema,
  templateListQuerySchema,
  type TemplateCreateInput,
  type TemplateListQuery,
} from '@/lib/validators/notifications';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, TemplateListQuery>({
  permission: ['settings', 'view'],
  querySchema: templateListQuerySchema,
  handler: async (ctx) => okPaginated(await notificationTemplateService.list(ctx.query)),
});

export const POST = defineRoute<TemplateCreateInput>({
  permission: ['settings', 'create'],
  bodySchema: templateCreateSchema,
  audit: { module: 'settings', action: 'create' },
  handler: async (ctx) => {
    const created = await notificationTemplateService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({ targetId: created.id, targetLabel: created.name, after: created.toJSON() });
    return ok(created, { message: 'Notification template created', status: 201 });
  },
});
