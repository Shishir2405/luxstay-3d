import 'server-only';
import type { FilterQuery } from 'mongoose';
import { ContentBlockModel, type ContentBlockAttrs } from '@/server/models/content-block.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { ContentBlockListQuery } from '@/lib/validators/content';

export const contentBlockRepository = {
  list(query: ContentBlockListQuery) {
    const filter: FilterQuery<ContentBlockAttrs & BaseFields> = {};
    if (query.locale) filter.locale = query.locale;
    if (query.isPublished) filter.isPublished = query.isPublished === 'true';
    return paginate(ContentBlockModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['key', 'title'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { key: 1 },
    });
  },

  findById(id: string) {
    return ContentBlockModel.findOne({ _id: id, isDeleted: false });
  },

  keyExists(key: string, locale: string) {
    return ContentBlockModel.exists({ key, locale, isDeleted: false }).then(Boolean);
  },

  keyExistsExcluding(key: string, locale: string, id: string) {
    return ContentBlockModel.exists({ key, locale, _id: { $ne: id }, isDeleted: false }).then(
      Boolean,
    );
  },

  create(data: Record<string, unknown>) {
    return ContentBlockModel.create(data);
  },
};
