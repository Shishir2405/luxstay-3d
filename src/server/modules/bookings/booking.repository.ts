import 'server-only';
import { BookingModel, type BookingAttrs } from '@/server/models/booking.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { FilterQuery } from 'mongoose';
import type { BookingStatus } from '@/lib/constants';

type BookingFilter = FilterQuery<BookingAttrs & BaseFields>;

export interface BookingListFilter {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  /** Restrict to a single guest (used by the customer dashboard). */
  userId?: string;
  email?: string;
}

export const bookingRepository = {
  list(filter: BookingListFilter) {
    const mongoFilter: BookingFilter = {};
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.userId) mongoFilter.user = filter.userId as unknown as BookingFilter['user'];
    if (filter.email)
      (mongoFilter as Record<string, unknown>)['contact.email'] = filter.email.toLowerCase();
    // Overlap on the first room's stay window keeps the common case fast.
    if (filter.dateFrom || filter.dateTo) {
      const range: Record<string, Date> = {};
      if (filter.dateFrom) range.$gte = filter.dateFrom;
      if (filter.dateTo) range.$lte = filter.dateTo;
      (mongoFilter as Record<string, unknown>).createdAt = range;
    }
    return paginate(BookingModel, {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      searchFields: ['bookingRef', 'contact.name', 'contact.email'],
      sortBy: filter.sortBy,
      sortDir: filter.sortDir,
      filter: mongoFilter,
      defaultSort: { createdAt: -1 },
    });
  },

  findById(id: string) {
    return BookingModel.findOne({ _id: id, isDeleted: false });
  },

  findByRef(bookingRef: string) {
    return BookingModel.findOne({ bookingRef, isDeleted: false });
  },

  refExists(bookingRef: string) {
    return BookingModel.exists({ bookingRef }).then(Boolean);
  },

  create(data: Record<string, unknown>) {
    return BookingModel.create(data as Partial<BookingAttrs>);
  },
};
