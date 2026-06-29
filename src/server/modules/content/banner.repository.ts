import 'server-only';
import type { FilterQuery } from 'mongoose';
import { BannerModel, type BannerAttrs } from '@/server/models/banner.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { BannerListQuery } from '@/lib/validators/content';

/** Builds the soft-delete + active + within-schedule-window filter. */
function scheduledWindowFilter(now: Date): FilterQuery<BannerAttrs & BaseFields> {
  return {
    isDeleted: false,
    isActive: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
    ],
  };
}

export const bannerRepository = {
  list(query: BannerListQuery) {
    const filter: FilterQuery<BannerAttrs & BaseFields> = {};
    if (query.placement) filter.placement = query.placement;
    if (query.isActive) filter.isActive = query.isActive === 'true';
    if (query.active === 'true') {
      const now = new Date();
      filter.$and = [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
      ];
      filter.isActive = true;
    }
    return paginate(BannerModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['title', 'placement'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { sortOrder: 1, createdAt: -1 },
    });
  },

  /** Currently-live banners for a placement, honoring the start/end window. */
  activeBanners(placement: string) {
    const filter = scheduledWindowFilter(new Date());
    filter.placement = placement;
    return BannerModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
  },

  findById(id: string) {
    return BannerModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return BannerModel.create(data);
  },
};
