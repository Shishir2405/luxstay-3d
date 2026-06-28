import 'server-only';
import { UserModel, type UserDoc } from '@/server/models/user.model';
import type { RoleName } from '@/lib/constants';
import type { FilterQuery } from 'mongoose';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash?: string | null;
  phone?: string;
  role?: RoleName;
  googleId?: string | null;
  emailVerifiedAt?: Date | null;
  createdBy?: string | null;
}

export const userRepository = {
  findById(id: string) {
    return UserModel.findOne({ _id: id, isDeleted: false });
  },

  /** Includes the normally-hidden passwordHash + twoFactorSecret for auth checks. */
  findByEmailWithSecrets(email: string) {
    return UserModel.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
      '+passwordHash +twoFactorSecret',
    );
  },

  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase(), isDeleted: false });
  },

  findByGoogleId(googleId: string) {
    return UserModel.findOne({ googleId, isDeleted: false });
  },

  create(input: CreateUserInput) {
    return UserModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash ?? null,
      phone: input.phone ?? '',
      role: input.role ?? 'Guest',
      googleId: input.googleId ?? null,
      emailVerifiedAt: input.emailVerifiedAt ?? null,
      createdBy: input.createdBy ?? null,
    });
  },

  updateLastLogin(id: string) {
    return UserModel.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } });
  },

  incrementTokenVersion(id: string) {
    return UserModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } });
  },

  async paginate(
    filter: FilterQuery<UserDoc>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);
    return { items, total };
  },
};
