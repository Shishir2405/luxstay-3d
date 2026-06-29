import 'server-only';
import type { FilterQuery } from 'mongoose';
import { EventModel, type EventAttrs } from '@/server/models/event.model';
import { EventScheduleModel } from '@/server/models/event-schedule.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import type { EventListQuery } from '@/lib/validators/events';

export const eventRepository = {
  list(query: EventListQuery, filter: FilterQuery<EventAttrs & BaseFields> = {}) {
    return paginate(EventModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['title', 'venue', 'description'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { startAt: -1 },
    });
  },

  findById(id: string) {
    return EventModel.findOne({ _id: id, isDeleted: false });
  },

  findBySlug(slug: string) {
    return EventModel.findOne({ slug, isDeleted: false });
  },

  slugExists(slug: string) {
    return EventModel.exists({ slug, isDeleted: false }).then(Boolean);
  },

  create(data: Record<string, unknown>) {
    return EventModel.create(data);
  },

  listSchedule(eventId: string) {
    return EventScheduleModel.find({ event: eventId, isDeleted: false })
      .sort({ startAt: 1 })
      .lean();
  },

  createSchedule(data: Record<string, unknown>) {
    return EventScheduleModel.create(data);
  },
};
