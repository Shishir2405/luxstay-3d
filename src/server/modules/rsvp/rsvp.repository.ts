import 'server-only';
import type { FilterQuery } from 'mongoose';
import { RsvpModel, type RsvpAttrs } from '@/server/models/rsvp.model';
import { GuestCheckinModel, type GuestCheckinAttrs } from '@/server/models/guest-checkin.model';
import type { BaseFields } from '@/server/models/base';
import { paginate } from '@/server/utils/paginate';
import { RSVP_STATUS } from '@/lib/constants/enums';
import type { RsvpListQuery } from '@/lib/validators/rsvp';

type RsvpFilter = FilterQuery<RsvpAttrs & BaseFields>;

export const rsvpRepository = {
  list(query: RsvpListQuery) {
    const filter: RsvpFilter = {};
    if (query.event) filter.event = query.event as never;
    if (query.status) filter.status = query.status;
    if (query.tier) filter.tier = query.tier;
    return paginate(RsvpModel, {
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ['code', 'eventName', 'contact.name', 'contact.email'],
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      filter,
      defaultSort: { createdAt: -1 },
    });
  },

  findById(id: string) {
    return RsvpModel.findOne({ _id: id, isDeleted: false });
  },

  countConfirmed(eventId: string) {
    return RsvpModel.countDocuments({
      event: eventId,
      isDeleted: false,
      status: { $in: [RSVP_STATUS.CONFIRMED, RSVP_STATUS.CHECKED_IN] },
    });
  },

  create(data: Record<string, unknown>) {
    return RsvpModel.create(data);
  },

  createCheckin(data: Partial<GuestCheckinAttrs> & { createdBy?: string | null }) {
    return GuestCheckinModel.create(data);
  },
};
