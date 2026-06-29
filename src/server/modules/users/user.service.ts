import 'server-only';
import type { FilterQuery } from 'mongoose';
import { UserModel, type UserDoc } from '@/server/models/user.model';
import { userRepository } from './user.repository';
import { paginate } from '@/server/utils/paginate';
import { ApiError } from '@/server/utils/api-error';
import { hashPassword } from '@/server/utils/password';
import type { UserCreateInput, UserUpdateInput, UserListQuery } from '@/lib/validators/settings';

/** Strips secrets from a serialized user so they never leave the server. */
function toPublicUser(doc: UserDoc): Record<string, unknown> {
  const { passwordHash, twoFactorSecret, ...rest } = doc.toJSON() as Record<string, unknown>;
  void passwordHash;
  void twoFactorSecret;
  return rest;
}

export const userService = {
  list(query: UserListQuery) {
    const filter: FilterQuery<UserDoc> = {};
    if (query.role) filter.role = query.role;
    if (query.isActive) filter.isActive = query.isActive === 'true';

    return paginate(UserModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['name', 'email', 'phone'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { createdAt: -1 },
    });
  },

  async getById(id: string) {
    const doc = await userRepository.findById(id);
    if (!doc) throw ApiError.notFound('User not found');
    return toPublicUser(doc);
  },

  async create(input: UserCreateInput, actorId: string | null) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict('A user with this email already exists');

    const passwordHash = await hashPassword(input.password);
    const created = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: input.role,
      createdBy: actorId,
    });
    if (input.isActive === false) {
      created.isActive = false;
      await created.save();
    }
    return toPublicUser(created);
  },

  async updateRoleAndStatus(id: string, input: UserUpdateInput, actorId: string | null) {
    const doc = await userRepository.findById(id);
    if (!doc) throw ApiError.notFound('User not found');
    const before = toPublicUser(doc);

    if (input.role !== undefined) doc.role = input.role;
    if (input.isActive !== undefined) doc.isActive = input.isActive;
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: toPublicUser(doc) };
  },

  async softDelete(id: string, actorId: string | null) {
    const doc = await userRepository.findById(id);
    if (!doc) throw ApiError.notFound('User not found');
    const before = toPublicUser(doc);
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
