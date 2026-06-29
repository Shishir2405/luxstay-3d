import 'server-only';
import type { FilterQuery } from 'mongoose';
import { MediaAssetModel, type MediaAssetAttrs } from '@/server/models/media-asset.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { MediaListQuery } from '@/lib/validators/content';

export const mediaRepository = {
  list(query: MediaListQuery) {
    const filter: FilterQuery<MediaAssetAttrs & BaseFields> = {};
    if (query.type) filter.type = query.type;
    if (query.folder) filter.folder = query.folder;
    return paginate(MediaAssetModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['title', 'alt', 'folder'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { createdAt: -1 },
    });
  },

  findById(id: string) {
    return MediaAssetModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return MediaAssetModel.create(data);
  },
};
