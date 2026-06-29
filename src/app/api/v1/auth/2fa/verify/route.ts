import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import { userRepository } from '@/server/modules/users/user.repository';
import { verifyTotp } from '@/server/modules/security/totp.service';
import { twoFactorVerifySchema, type TwoFactorVerifyInput } from '@/lib/validators/settings';

export const runtime = 'nodejs';

/** Confirms a TOTP code against the enrolled secret and enables 2FA on success. */
export const POST = defineRoute<TwoFactorVerifyInput>({
  auth: true,
  bodySchema: twoFactorVerifySchema,
  audit: { module: 'users', action: 'update' },
  handler: async (ctx) => {
    const user = await userRepository.findById(ctx.user!.id).select('+twoFactorSecret');
    if (!user) throw ApiError.notFound('User not found');
    if (!user.twoFactorSecret) {
      throw ApiError.badRequest('Start two-factor setup before verifying');
    }

    if (!verifyTotp(user.twoFactorSecret, ctx.body.token)) {
      throw ApiError.badRequest('Invalid or expired code');
    }

    user.twoFactorEnabled = true;
    await user.save();

    ctx.audit.record({ targetId: ctx.user!.id, summary: 'Enabled two-factor authentication' });
    return ok({ twoFactorEnabled: true }, { message: 'Two-factor authentication enabled' });
  },
});
