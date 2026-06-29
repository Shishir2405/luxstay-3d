import 'server-only';
import type { FilterQuery } from 'mongoose';
import { MenuItemModel } from '@/server/models/menu-item.model';
import type { MenuItemAttrs } from '@/server/models/menu-item.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { MenuItemListQuery } from '@/lib/validators/menu';

type ItemFilter = FilterQuery<MenuItemAttrs & BaseFields>;

export const menuItemRepository = {
  list(query: MenuItemListQuery) {
    const filter: ItemFilter = {};
    if (query.category) filter.category = query.category;
    if (query.isAvailable) filter.isAvailable = query.isAvailable === 'true';
    if (query.isSeasonal) filter.isSeasonal = query.isSeasonal === 'true';
    return paginate(MenuItemModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['name', 'description'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { sortOrder: 1, name: 1 },
      populate: 'category',
    });
  },

  findById(id: string) {
    return MenuItemModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return MenuItemModel.create(data);
  },
};
