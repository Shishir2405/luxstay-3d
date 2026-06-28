import 'server-only';
import { userRepository } from '@/server/modules/users/user.repository';
import { hashPassword, verifyPassword } from '@/server/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/server/auth/jwt';
import { ApiError } from '@/server/utils/api-error';
import { permissionsForRole, ROLES, type RoleName } from '@/lib/constants';
import type { AuthUser } from '@/lib/types';
import type { UserDoc } from '@/server/models/user.model';
import type { RegisterInput } from '@/lib/validators';

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/** Projects a user document into the public AuthUser (role → permissions). */
export function toAuthUser(doc: UserDoc): AuthUser {
  const role = (doc.role as RoleName) ?? ROLES.GUEST;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role,
    permissions: permissionsForRole(role),
    twoFactorEnabled: Boolean(doc.twoFactorEnabled),
    avatarUrl: doc.avatarUrl || undefined,
  };
}

function issueTokens(
  user: AuthUser,
  tokenVersion: number,
): { accessToken: string; refreshToken: string } {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    twoFactorEnabled: user.twoFactorEnabled,
    avatarUrl: user.avatarUrl,
  });
  const refreshToken = signRefreshToken({ sub: user.id, tv: tokenVersion });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await hashPassword(input.password);
    const doc = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone || '',
      role: ROLES.GUEST,
    });

    const user = toAuthUser(doc);
    return { user, ...issueTokens(user, doc.tokenVersion) };
  },

  async login(email: string, password: string, totp?: string): Promise<AuthResult> {
    const doc = await userRepository.findByEmailWithSecrets(email);
    if (!doc || !doc.passwordHash) throw ApiError.unauthorized('Invalid email or password');
    if (!doc.isActive) throw ApiError.forbidden('This account has been deactivated');

    const valid = await verifyPassword(password, doc.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    if (doc.twoFactorEnabled) {
      if (!totp) {
        throw new ApiError('UNAUTHORIZED', 'Two-factor authentication code required', [
          { field: 'totp', message: 'Enter your 6-digit code' },
        ]);
      }
      const { verifyTotp } = await import('@/server/modules/security/totp.service');
      const okCode = verifyTotp(doc.twoFactorSecret ?? '', totp);
      if (!okCode) throw ApiError.unauthorized('Invalid two-factor code');
    }

    await userRepository.updateLastLogin(doc._id.toString());
    const user = toAuthUser(doc);
    return { user, ...issueTokens(user, doc.tokenVersion) };
  },

  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Session expired, please sign in again');
    }
    const doc = await userRepository.findById(payload.sub);
    if (!doc || !doc.isActive) throw ApiError.unauthorized('Session is no longer valid');
    if (doc.tokenVersion !== payload.tv) throw ApiError.unauthorized('Session has been revoked');

    const user = toAuthUser(doc);
    return { user, ...issueTokens(user, doc.tokenVersion) };
  },

  /** Revokes all outstanding refresh tokens for a user (logout everywhere). */
  async revokeAll(userId: string): Promise<void> {
    await userRepository.incrementTokenVersion(userId);
  },
};
