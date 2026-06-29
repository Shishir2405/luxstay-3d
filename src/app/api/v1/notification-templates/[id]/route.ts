import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { notificationTemplateService } from '@/server/modules/email/notification-template.service';
import { objectIdSchema } from '@/lib/validators/common';
import { templateUpdateSchema } from '@/lib/validators/notifications';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type UpdateBody = z.infer<typeof templateUpdateSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['settings', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await notificationTemplateService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UpdateBody, unknown, Params>({
  permission: ['settings', 'edit'],
  paramsSchema,
  bodySchema: templateUpdateSchema,
  audit: { module: 'settings', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await notificationTemplateService.update(
      ctx.params.id,
      ctx.body,
      ctx.user!.id,
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'Notification template updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['settings', 'delete'],
  paramsSchema,
  audit: { module: 'settings', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await notificationTemplateService.remove(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'Notification template removed' });
  },
});
