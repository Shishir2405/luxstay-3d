import 'server-only';
import jwt from 'jsonwebtoken';
import { env } from '@/server/config/env';
import type { Permission, RoleName } from '@/lib/constants';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: RoleName;
  permissions: Permission[];
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tv: number; // token version — bump to revoke outstanding refresh tokens
  type: 'refresh';
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessTtl,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}
