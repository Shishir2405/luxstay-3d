import 'server-only';
import {
  RoomTypeModel,
  type RoomTypeAttrs,
  type RoomTypeDoc,
} from '@/server/models/room-type.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { FilterQuery } from 'mongoose';

type RoomTypeFilter = FilterQuery<RoomTypeAttrs & BaseFields>;

export interface RoomTypeListFilter {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  isActive?: boolean;
  isFeatured?: boolean;
}

export const roomTypeRepository = {
  list(filter: RoomTypeListFilter) {
    const mongoFilter: RoomTypeFilter = {};
    if (filter.isActive !== undefined) mongoFilter.isActive = filter.isActive;
    if (filter.isFeatured !== undefined) mongoFilter.isFeatured = filter.isFeatured;
    return paginate(RoomTypeModel, {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      searchFields: ['name', 'description', 'shortDescription'],
      sortBy: filter.sortBy,
      sortDir: filter.sortDir,
      filter: mongoFilter,
      defaultSort: { sortOrder: 1, createdAt: -1 },
      populate: 'amenities',
    });
  },

  findById(id: string) {
    return RoomTypeModel.findOne({ _id: id, isDeleted: false }).populate('amenities');
  },

  slugExists(slug: string, excludeId?: string) {
    const filter: RoomTypeFilter = { slug, isDeleted: false };
    if (excludeId) (filter as Record<string, unknown>)._id = { $ne: excludeId };
    return RoomTypeModel.exists(filter).then(Boolean);
  },

  // Accepts validator output (string ids etc.); Mongoose casts to the schema types.
  create(data: Record<string, unknown>): Promise<RoomTypeDoc> {
    return RoomTypeModel.create(data as Partial<RoomTypeAttrs>) as Promise<RoomTypeDoc>;
  },

  findAllForExport() {
    return RoomTypeModel.find({ isDeleted: false }).sort({ sortOrder: 1, name: 1 }).lean();
  },
};
