import 'server-only';
import { WishlistModel } from '@/server/models/wishlist.model';
import { paginate } from '@/server/utils/paginate';
import { ApiError } from '@/server/utils/api-error';
import type { PaginationQuery } from '@/lib/validators/common';

export const wishlistService = {
  list(userId: string, query: PaginationQuery) {
    return paginate(WishlistModel, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter: { user: userId },
      defaultSort: { createdAt: -1 },
      populate: 'roomType',
    });
  },

  /** Idempotent add: re-adding a removed entry restores it. */
  async add(userId: string, roomTypeId: string) {
    const existing = await WishlistModel.findOne({ user: userId, roomType: roomTypeId });
    if (existing) {
      if (existing.isDeleted) {
        existing.isDeleted = false;
        existing.deletedAt = null;
        existing.updatedBy = userId as never;
        await existing.save();
      }
      return existing;
    }
    return WishlistModel.create({ user: userId, roomType: roomTypeId, createdBy: userId });
  },

  async remove(userId: string, id: string) {
    const doc = await WishlistModel.findOne({ _id: id, user: userId, isDeleted: false });
    if (!doc) throw ApiError.notFound('Wishlist item not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = userId as never;
    await doc.save();
    return { before };
  },
};
