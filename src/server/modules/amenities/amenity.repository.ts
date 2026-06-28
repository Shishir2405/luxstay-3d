import 'server-only';
import { AmenityModel, type AmenityAttrs } from '@/server/models/amenity.model';
import { paginate } from '@/server/utils/paginate';
import type { PaginationQuery } from '@/lib/validators/common';

export const amenityRepository = {
  list(query: PaginationQuery) {
    return paginate(AmenityModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['name', 'category'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      defaultSort: { sortOrder: 1, name: 1 },
    });
  },

  findById(id: string) {
    return AmenityModel.findOne({ _id: id, isDeleted: false });
  },

  slugExists(slug: string) {
    return AmenityModel.exists({ slug, isDeleted: false }).then(Boolean);
  },

  create(data: Partial<AmenityAttrs> & { createdBy?: string | null }) {
    return AmenityModel.create(data);
  },
};
