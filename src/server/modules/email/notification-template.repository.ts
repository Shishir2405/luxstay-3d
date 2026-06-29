import 'server-only';
import type { FilterQuery } from 'mongoose';
import {
  NotificationTemplateModel,
  type NotificationTemplateAttrs,
} from '@/server/models/notification-template.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { TemplateListQuery } from '@/lib/validators/notifications';

type TemplateFilter = FilterQuery<NotificationTemplateAttrs & BaseFields>;

export const notificationTemplateRepository = {
  list(query: TemplateListQuery) {
    const filter: TemplateFilter = {};
    if (query.channel) filter.channel = query.channel;
    if (query.isActive) filter.isActive = query.isActive === 'true';

    return paginate(NotificationTemplateModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['key', 'name', 'subject'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { name: 1 },
    });
  },

  findById(id: string) {
    return NotificationTemplateModel.findOne({ _id: id, isDeleted: false });
  },

  keyExists(key: string) {
    return NotificationTemplateModel.exists({ key, isDeleted: false }).then(Boolean);
  },

  create(data: Partial<NotificationTemplateAttrs> & { createdBy?: string | null }) {
    return NotificationTemplateModel.create(data);
  },
};
