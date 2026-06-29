import 'server-only';
import { LoyaltyTransactionModel } from '@/server/models/loyalty-transaction.model';
import { UserModel } from '@/server/models/user.model';
import { paginate } from '@/server/utils/paginate';
import { ApiError } from '@/server/utils/api-error';
import type { PaginationQuery } from '@/lib/validators/common';

async function applyDelta(userId: string, delta: number, reason: string, booking: string | null) {
  const user = await UserModel.findOne({ _id: userId, isDeleted: false });
  if (!user) throw ApiError.notFound('User not found');

  const balanceAfter = (user.loyaltyPoints ?? 0) + delta;
  if (balanceAfter < 0) throw ApiError.badRequest('Insufficient loyalty points');

  user.loyaltyPoints = balanceAfter;
  user.updatedBy = userId as never;
  await user.save();

  const tx = await LoyaltyTransactionModel.create({
    user: userId,
    points: delta,
    reason,
    booking: booking ?? null,
    balanceAfter,
    createdBy: userId,
  });

  return { transaction: tx, balanceAfter };
}

export const loyaltyService = {
  /** Award points (positive). */
  accrue(userId: string, points: number, reason: string, booking: string | null = null) {
    if (points <= 0) throw ApiError.badRequest('Accrual points must be positive');
    return applyDelta(userId, points, reason, booking);
  },

  /** Spend points (positive amount, stored as a negative delta). */
  redeem(userId: string, points: number, reason: string) {
    if (points <= 0) throw ApiError.badRequest('Redeem points must be positive');
    return applyDelta(userId, -points, reason, null);
  },

  async balance(userId: string) {
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) throw ApiError.notFound('User not found');
    return user.loyaltyPoints ?? 0;
  },

  transactions(userId: string, query: PaginationQuery) {
    return paginate(LoyaltyTransactionModel, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter: { user: userId },
      defaultSort: { createdAt: -1 },
    });
  },
};
