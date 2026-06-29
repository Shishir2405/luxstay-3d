import 'server-only';
import type { PipelineStage } from 'mongoose';
import { BookingModel } from '@/server/models/booking.model';
import { PaymentTransactionModel } from '@/server/models/payment-transaction.model';
import { RoomUnitModel } from '@/server/models/room-unit.model';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { BOOKING_STATUS, PAYMENT_STATUS, ROOM_UNIT_STATUS } from '@/lib/constants/enums';
import { toNightKey } from '@/server/utils/dates';
import type { RevenueTrendQuery, BookingReportQuery } from '@/lib/validators/analytics';

/** Round to 2 decimal places (money is stored in major units). */
function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Round a ratio to a whole-number percentage. */
function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/** Start/end of the UTC day for a given date (defaults to now). */
function dayBounds(date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/** Default trend window: last 30 days through end of today. */
function defaultRange(from?: Date, to?: Date): { from: Date; to: Date } {
  const end = to ?? dayBounds().end;
  const start = from ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: start, to: end };
}

/** $dateToString format token for the requested bucket granularity. */
function bucketFormat(period: RevenueTrendQuery['period']): string {
  if (period === 'monthly') return '%Y-%m';
  if (period === 'weekly') return '%G-W%V';
  return '%Y-%m-%d';
}

/** Statuses that represent realized/committed revenue (exclude cancelled/no-show). */
const REVENUE_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.CHECKED_OUT,
  BOOKING_STATUS.COMPLETED,
];

export const analyticsService = {
  /** Top-of-dashboard KPI cards. */
  async dashboardSummary() {
    const { start, end } = dayBounds();

    const [
      totalUnits,
      occupiedUnits,
      todaysCheckIns,
      todaysCheckOuts,
      revenueAgg,
      pendingAgg,
      lowAvailability,
    ] = await Promise.all([
      RoomUnitModel.countDocuments({ isDeleted: false, isActive: true }),
      RoomUnitModel.countDocuments({
        isDeleted: false,
        isActive: true,
        status: ROOM_UNIT_STATUS.BOOKED,
      }),
      // Stays beginning today.
      BookingModel.countDocuments({
        isDeleted: false,
        status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW] },
        'rooms.dateFrom': { $gte: start, $lt: end },
      }),
      // Stays ending today.
      BookingModel.countDocuments({
        isDeleted: false,
        status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW] },
        'rooms.dateTo': { $gte: start, $lt: end },
      }),
      // Captured payments today.
      PaymentTransactionModel.aggregate<{ total: number }>([
        {
          $match: {
            isDeleted: false,
            status: PAYMENT_STATUS.CAPTURED,
            createdAt: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Outstanding balances on active bookings.
      BookingModel.aggregate<{ total: number }>([
        {
          $match: {
            isDeleted: false,
            status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW] },
            'payment.amountDue': { $gt: 0 },
          },
        },
        { $group: { _id: null, total: { $sum: '$payment.amountDue' } } },
      ]),
      // Room types running low on bookable inventory.
      this.lowAvailabilityWarnings(),
    ]);

    return {
      occupancyRate: pct(occupiedUnits, totalUnits),
      todaysCheckIns,
      todaysCheckOuts,
      revenueToday: money(revenueAgg[0]?.total ?? 0),
      pendingPayments: money(pendingAgg[0]?.total ?? 0),
      lowAvailabilityWarnings: lowAvailability,
    };
  },

  /**
   * Room types whose available units are at or below a threshold.
   * Returns a small list usable as dashboard warning chips.
   */
  async lowAvailabilityWarnings(threshold = 2) {
    const rows = await RoomUnitModel.aggregate<{
      _id: unknown;
      total: number;
      available: number;
    }>([
      { $match: { isDeleted: false, isActive: true } },
      {
        $group: {
          _id: '$roomType',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', ROOM_UNIT_STATUS.AVAILABLE] }, 1, 0] },
          },
        },
      },
      { $match: { available: { $lte: threshold } } },
      {
        $lookup: {
          from: RoomTypeModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'roomType',
        },
      },
      { $unwind: { path: '$roomType', preserveNullAndEmptyArrays: true } },
      { $sort: { available: 1 } },
    ]);

    return rows.map((r) => ({
      roomTypeId: r._id ? String(r._id) : null,
      roomTypeName: (r as { roomType?: { name?: string } }).roomType?.name ?? 'Unknown',
      available: r.available,
      total: r.total,
    }));
  },

  /** Revenue (captured payments) bucketed by day/week/month for a date range. */
  async revenueTrend(query: RevenueTrendQuery) {
    const { from, to } = defaultRange(query.from, query.to);
    const format = bucketFormat(query.period);

    const rows = await PaymentTransactionModel.aggregate<{
      _id: string;
      revenue: number;
      count: number;
    }>([
      {
        $match: {
          isDeleted: false,
          status: PAYMENT_STATUS.CAPTURED,
          createdAt: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      period: query.period,
      from: toNightKey(from),
      to: toNightKey(to),
      points: rows.map((r) => ({
        bucket: r._id,
        revenue: money(r.revenue),
        transactions: r.count,
      })),
    };
  },

  /**
   * RevPAR = revenue per available room (room-night basis) for a date range.
   * availableRoomNights = active units × nights in range.
   */
  async revpar(from?: Date, to?: Date) {
    const range = defaultRange(from, to);
    const nights = Math.max(
      1,
      Math.round((range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000)),
    );

    const [revenueAgg, totalUnits] = await Promise.all([
      PaymentTransactionModel.aggregate<{ total: number }>([
        {
          $match: {
            isDeleted: false,
            status: PAYMENT_STATUS.CAPTURED,
            createdAt: { $gte: range.from, $lt: range.to },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      RoomUnitModel.countDocuments({ isDeleted: false, isActive: true }),
    ]);

    const revenue = revenueAgg[0]?.total ?? 0;
    const availableRoomNights = totalUnits * nights;

    return {
      from: toNightKey(range.from),
      to: toNightKey(range.to),
      nights,
      totalUnits,
      revenue: money(revenue),
      availableRoomNights,
      revpar: availableRoomNights > 0 ? money(revenue / availableRoomNights) : 0,
    };
  },

  /** Detailed per-booking rows for the report table / CSV export. */
  async bookingReport(query: BookingReportQuery) {
    const match: PipelineStage.Match['$match'] = { isDeleted: false };
    if (query.status) match.status = query.status;
    if (query.source) match.source = query.source;
    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.$gte = query.from;
      if (query.to) createdAt.$lt = query.to;
      match.createdAt = createdAt;
    }

    const rows = await BookingModel.aggregate<{
      _id: unknown;
      bookingRef: string;
      guestName: string;
      guestEmail: string;
      status: string;
      source: string;
      nights: number;
      rooms: number;
      total: number;
      amountPaid: number;
      amountDue: number;
      currency: string;
      createdAt: Date;
    }>([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: 5000 },
      {
        $project: {
          bookingRef: 1,
          guestName: '$contact.name',
          guestEmail: '$contact.email',
          status: 1,
          source: 1,
          rooms: { $size: { $ifNull: ['$rooms', []] } },
          nights: { $sum: '$rooms.nights' },
          total: '$pricing.total',
          amountPaid: '$payment.amountPaid',
          amountDue: '$payment.amountDue',
          currency: '$pricing.currency',
          createdAt: 1,
        },
      },
    ]);

    return rows.map((r) => ({
      id: String(r._id),
      bookingRef: r.bookingRef,
      guestName: r.guestName ?? '',
      guestEmail: r.guestEmail ?? '',
      status: r.status,
      source: r.source ?? '',
      rooms: r.rooms ?? 0,
      nights: r.nights ?? 0,
      total: money(r.total ?? 0),
      amountPaid: money(r.amountPaid ?? 0),
      amountDue: money(r.amountDue ?? 0),
      currency: r.currency ?? 'INR',
      createdAt: r.createdAt,
    }));
  },

  /** Booking pipeline funnel — counts of bookings reaching each stage. */
  async conversionFunnel() {
    const rows = await BookingModel.aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus = new Map(rows.map((r) => [r._id, r.count]));
    const countOf = (statuses: string[]) =>
      statuses.reduce((sum, s) => sum + (byStatus.get(s) ?? 0), 0);

    const total = rows.reduce((sum, r) => sum + r.count, 0);
    const confirmed = countOf(REVENUE_STATUSES);
    const completed = countOf([BOOKING_STATUS.CHECKED_OUT, BOOKING_STATUS.COMPLETED]);

    return {
      created: total,
      confirmed,
      completed,
      cancelled: countOf([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW]),
      conversionRate: pct(confirmed, total),
      byStatus: rows.map((r) => ({ status: r._id, count: r.count })),
    };
  },
};
