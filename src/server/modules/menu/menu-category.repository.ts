import 'server-only';
import type { FilterQuery } from 'mongoose';
import { MenuCategoryModel } from '@/server/models/menu-category.model';
import type { MenuCategoryAttrs } from '@/server/models/menu-category.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { MenuCategoryListQuery } from '@/lib/validators/menu';

type CategoryFilter = FilterQuery<MenuCategoryAttrs & BaseFields>;

export const menuCategoryRepository = {
  list(query: MenuCategoryListQuery) {
    const filter: CategoryFilter = {};
    if (query.kind) filter.kind = query.kind;
    if (query.isActive) filter.isActive = query.isActive === 'true';
    return paginate(MenuCategoryModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['name', 'description'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { sortOrder: 1, name: 1 },
    });
  },

  findById(id: string) {
    return MenuCategoryModel.findOne({ _id: id, isDeleted: false });
  },

  slugExists(slug: string) {
    return MenuCategoryModel.exists({ slug, isDeleted: false }).then(Boolean);
  },

  create(data: Record<string, unknown>) {
    return MenuCategoryModel.create(data);
  },
};
