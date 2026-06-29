import 'server-only';
import type { FilterQuery } from 'mongoose';
import { TableLayoutModel, type TableLayoutAttrs } from '@/server/models/table-layout.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { TableListQuery } from '@/lib/validators/rsvp';

type TableFilter = FilterQuery<TableLayoutAttrs & BaseFields>;

export const tableRepository = {
  list(query: TableListQuery) {
    const filter: TableFilter = {};
    if (query.zone) filter.zone = query.zone;
    if (query.isActive) filter.isActive = query.isActive === 'true';
    return paginate(TableLayoutModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['name', 'zone'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { zone: 1, name: 1 },
    });
  },

  findById(id: string) {
    return TableLayoutModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return TableLayoutModel.create(data);
  },
};
