import 'server-only';
import type { FilterQuery } from 'mongoose';
import { OfferModel } from '@/server/models/offer.model';
import type { OfferAttrs } from '@/server/models/offer.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { OfferListQuery } from '@/lib/validators/menu';

type OfferFilter = FilterQuery<OfferAttrs & BaseFields>;

export const offerRepository = {
  list(query: OfferListQuery) {
    const filter: OfferFilter = {};
    if (query.kind) filter.kind = query.kind;
    if (query.isActive) filter.isActive = query.isActive === 'true';
    return paginate(OfferModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['title', 'description', 'discountText'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { startAt: -1, createdAt: -1 },
    });
  },

  findById(id: string) {
    return OfferModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return OfferModel.create(data);
  },
};
