import 'server-only';
import type { FilterQuery } from 'mongoose';
import { ReviewModel, type ReviewAttrs } from '@/server/models/review.model';
import { type BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { ReviewListQuery } from '@/lib/validators/customer';
import type { PaginationQuery } from '@/lib/validators/common';
import { REVIEW_STATUS } from '@/lib/constants';

type ReviewFilter = FilterQuery<ReviewAttrs & BaseFields>;

export const reviewRepository = {
  list(query: ReviewListQuery) {
    const filter: ReviewFilter = {};
    if (query.status) filter.status = query.status;
    if (query.roomType) filter.roomType = query.roomType;
    return paginate(ReviewModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['authorName', 'title', 'body'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { createdAt: -1 },
      populate: 'roomType',
    });
  },

  listPublic(roomTypeId: string, query: PaginationQuery) {
    const filter: ReviewFilter = {
      roomType: roomTypeId,
      status: REVIEW_STATUS.APPROVED,
      isPublic: true,
    };
    return paginate(ReviewModel, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { createdAt: -1 },
    });
  },

  findById(id: string) {
    return ReviewModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return ReviewModel.create(data);
  },
};
