import 'server-only';
import type { FilterQuery } from 'mongoose';
import { SeoMetaModel, type SeoMetaAttrs } from '@/server/models/seo-meta.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { SeoListQuery } from '@/lib/validators/content';

export const seoRepository = {
  list(query: SeoListQuery) {
    const filter: FilterQuery<SeoMetaAttrs & BaseFields> = {};
    if (query.locale) filter.locale = query.locale;
    return paginate(SeoMetaModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['path', 'title', 'description'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { path: 1 },
    });
  },

  findById(id: string) {
    return SeoMetaModel.findOne({ _id: id, isDeleted: false });
  },

  pathExists(path: string) {
    return SeoMetaModel.exists({ path, isDeleted: false }).then(Boolean);
  },

  pathExistsExcluding(path: string, id: string) {
    return SeoMetaModel.exists({ path, _id: { $ne: id }, isDeleted: false }).then(Boolean);
  },

  create(data: Record<string, unknown>) {
    return SeoMetaModel.create(data);
  },
};
