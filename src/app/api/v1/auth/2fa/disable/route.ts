import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import { userRepository } from '@/server/modules/users/user.repository';

export const runtime = 'nodejs';

/** Turns off two-factor auth for the current user and clears the stored secret. */
export const POST = defineRoute({
  auth: true,
  audit: { module: 'users', action: 'update' },
  handler: async (ctx) => {
    const user = await userRepository.findById(ctx.user!.id);
    if (!user) throw ApiError.notFound('User not found');

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    ctx.audit.record({ targetId: ctx.user!.id, summary: 'Disabled two-factor authentication' });
    return ok({ twoFactorEnabled: false }, { message: 'Two-factor authentication disabled' });
  },
});
