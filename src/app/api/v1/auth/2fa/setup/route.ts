import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { ApiError } from '@/server/utils/api-error';
import { userRepository } from '@/server/modules/users/user.repository';
import { generateTotpSecret, buildOtpAuthUrl } from '@/server/modules/security/totp.service';

export const runtime = 'nodejs';

/**
 * Begins TOTP enrollment for the current user: stores a fresh secret (still
 * disabled until verified) and returns the otpauth URL for QR rendering.
 */
export const POST = defineRoute({
  auth: true,
  handler: async (ctx) => {
    const user = await userRepository.findById(ctx.user!.id);
    if (!user) throw ApiError.notFound('User not found');

    const secret = generateTotpSecret();
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;
    await user.save();

    return ok(
      { otpauthUrl: buildOtpAuthUrl(secret, user.email), secret },
      { message: 'Scan the QR code, then verify a code to finish enrollment' },
    );
  },
});
