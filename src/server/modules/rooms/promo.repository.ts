import 'server-only';
import { PromoCodeModel, type PromoCodeAttrs } from '@/server/models/promo-code.model';
import { paginate } from '@/server/utils/paginate';

export const promoRepository = {
  list(filter: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    return paginate(PromoCodeModel, {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      searchFields: ['code', 'description'],
      sortBy: filter.sortBy,
      sortDir: filter.sortDir,
      defaultSort: { createdAt: -1 },
    });
  },

  findById(id: string) {
    return PromoCodeModel.findOne({ _id: id, isDeleted: false });
  },

  findByCode(code: string) {
    return PromoCodeModel.findOne({ code: code.toUpperCase(), isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return PromoCodeModel.create(data as Partial<PromoCodeAttrs>);
  },

  /** Atomically increments usage, guarding the usage limit (0 = unlimited). */
  redeem(id: string) {
    return PromoCodeModel.findOneAndUpdate(
      { _id: id, $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
      { $inc: { usedCount: 1 } },
      { new: true },
    );
  },
};
