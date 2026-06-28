import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { ROLES, type RoleName } from '@/lib/constants';

export interface UserAttrs {
  name: string;
  email: string;
  passwordHash?: string | null;
  phone: string;
  avatarUrl: string;
  role: RoleName;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  tokenVersion: number;
  googleId: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  loyaltyPoints: number;
}

const userSchema = createSchema<UserAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, default: null, select: false },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },

  // Single role per user (RBAC source of truth; permissions are derived at sign-in)
  role: { type: String, enum: Object.values(ROLES), default: ROLES.GUEST, index: true },

  // Auth lifecycle
  isActive: { type: Boolean, default: true },
  emailVerifiedAt: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 }, // bump to revoke refresh tokens

  // OAuth
  googleId: { type: String, default: null, index: true, sparse: true },

  // 2FA (TOTP) — wired in the Security module
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null, select: false },

  // Guest-area extras (loyalty etc. expand in the Customer module)
  loyaltyPoints: { type: Number, default: 0 },
});

userSchema.index({ name: 'text', email: 'text' });

export type UserDoc = HydratedDocument<UserAttrs & BaseFields>;

export const UserModel = defineModel<UserAttrs & BaseFields>('User', userSchema);
