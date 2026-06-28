import 'server-only';
import { PricingRuleModel, type PricingRuleAttrs } from '@/server/models/pricing-rule.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { FilterQuery } from 'mongoose';

type RuleFilter = FilterQuery<PricingRuleAttrs & BaseFields>;

export const pricingRepository = {
  list(filter: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    roomType?: string;
  }) {
    const mongoFilter: RuleFilter = {};
    if (filter.roomType)
      mongoFilter.roomType = filter.roomType as unknown as RuleFilter['roomType'];
    return paginate(PricingRuleModel, {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      searchFields: ['name'],
      sortBy: filter.sortBy,
      sortDir: filter.sortDir,
      filter: mongoFilter,
      defaultSort: { priority: -1, createdAt: -1 },
    });
  },

  findById(id: string) {
    return PricingRuleModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return PricingRuleModel.create(data as Partial<PricingRuleAttrs>);
  },

  /** Active rules applicable to a room type (its own + global rules). */
  findActiveForType(roomTypeId: string) {
    return PricingRuleModel.find({
      isDeleted: false,
      isActive: true,
      $or: [{ roomType: roomTypeId }, { roomType: null }],
    })
      .sort({ priority: -1 })
      .lean();
  },
};
