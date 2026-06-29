import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { userService } from '@/server/modules/users/user.service';
import {
  userCreateSchema,
  userListQuerySchema,
  type UserCreateInput,
  type UserListQuery,
} from '@/lib/validators/settings';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, UserListQuery>({
  permission: ['users', 'view'],
  querySchema: userListQuerySchema,
  handler: async (ctx) => okPaginated(await userService.list(ctx.query)),
});

export const POST = defineRoute<UserCreateInput>({
  permission: ['users', 'create'],
  bodySchema: userCreateSchema,
  audit: { module: 'users', action: 'create' },
  handler: async (ctx) => {
    const created = await userService.create(ctx.body, ctx.user!.id);
    ctx.audit.record({
      targetId: String(created.id),
      targetLabel: String(created.name),
      after: created,
    });
    return ok(created, { message: 'User created', status: 201 });
  },
});
