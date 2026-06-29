import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { userService } from '@/server/modules/users/user.service';
import { objectIdSchema } from '@/lib/validators/common';
import { userUpdateSchema, type UserUpdateInput } from '@/lib/validators/settings';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  permission: ['users', 'view'],
  paramsSchema,
  handler: async (ctx) => ok(await userService.getById(ctx.params.id)),
});

export const PUT = defineRoute<UserUpdateInput, unknown, Params>({
  permission: ['users', 'edit'],
  paramsSchema,
  bodySchema: userUpdateSchema,
  audit: { module: 'users', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await userService.updateRoleAndStatus(
      ctx.params.id,
      ctx.body,
      ctx.user!.id,
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after });
    return ok(after, { message: 'User updated' });
  },
});

export const DELETE = defineRoute<unknown, unknown, Params>({
  permission: ['users', 'delete'],
  paramsSchema,
  audit: { module: 'users', action: 'delete' },
  handler: async (ctx) => {
    const { before } = await userService.softDelete(ctx.params.id, ctx.user!.id);
    ctx.audit.record({ targetId: ctx.params.id, before });
    return ok(null, { message: 'User removed' });
  },
});
