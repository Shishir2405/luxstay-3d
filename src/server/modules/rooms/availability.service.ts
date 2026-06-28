import 'server-only';
import { Types } from 'mongoose';
import { RoomNightLockModel } from '@/server/models/room-night-lock.model';
import { RoomUnitModel } from '@/server/models/room-unit.model';
import { ROOM_UNIT_STATUS } from '@/lib/constants';
import { ApiError } from '@/server/utils/api-error';
import { eachNight } from '@/server/utils/dates';

/** Statuses that make a unit unbookable regardless of the calendar. */
const UNBOOKABLE_STATUSES = [ROOM_UNIT_STATUS.MAINTENANCE, ROOM_UNIT_STATUS.OUT_OF_SERVICE];

export interface HoldResult {
  _id: string; // holdRef — pass to confirmHold/releaseHold
  roomUnit: string;
  unitNumber: string;
  dateFrom: Date;
  dateTo: Date;
  nights: string[];
}

/**
 * Availability + overbooking lock. Backed by the per-night occupancy ledger
 * (RoomNightLock) whose unique (roomUnit, night) index makes double-booking
 * physically impossible.
 */
export const availabilityService = {
  /** Bookable units (lean docs) of a type for [dateFrom, dateTo). */
  async findAvailableUnits(roomTypeId: string, dateFrom: Date, dateTo: Date) {
    const nights = eachNight(dateFrom, dateTo);
    if (nights.length === 0) return [];

    const units = await RoomUnitModel.find({
      roomType: roomTypeId,
      isDeleted: false,
      status: { $nin: UNBOOKABLE_STATUSES },
    }).lean();
    if (units.length === 0) return [];

    const unitIds = units.map((u) => u._id);
    const lockedIds = await RoomNightLockModel.distinct('roomUnit', {
      roomUnit: { $in: unitIds },
      night: { $in: nights },
    });
    const lockedSet = new Set(lockedIds.map(String));
    return units.filter((u) => !lockedSet.has(String(u._id)));
  },

  async countAvailableUnits(roomTypeId: string, dateFrom: Date, dateTo: Date) {
    return (await this.findAvailableUnits(roomTypeId, dateFrom, dateTo)).length;
  },

  /**
   * Atomically reserves ONE available unit of a type for the stay as a hold.
   * Iterates candidates; for each, attempts to insert all night locks. The
   * unique index rejects any night already taken (dup key) → we clean up the
   * partial hold and try the next unit. No race window: the DB, not the app,
   * decides who wins each night.
   */
  async acquireUnitHold(
    roomTypeId: string,
    dateFrom: Date,
    dateTo: Date,
    ttlMs: number,
    actorId: string | null,
  ): Promise<HoldResult> {
    const nights = eachNight(dateFrom, dateTo);
    if (nights.length === 0) throw ApiError.badRequest('Check-out must be after check-in');

    const candidates = await this.findAvailableUnits(roomTypeId, dateFrom, dateTo);
    if (candidates.length === 0)
      throw ApiError.conflict('No rooms available for the selected dates');

    const expiresAt = new Date(Date.now() + ttlMs);

    for (const unit of candidates) {
      const holdRef = new Types.ObjectId();
      const docs = nights.map((night) => ({
        roomUnit: unit._id,
        roomType: new Types.ObjectId(roomTypeId),
        night,
        kind: 'hold' as const,
        holdRef,
        expiresAt,
        createdBy: actorId ? new Types.ObjectId(actorId) : null,
      }));
      try {
        await RoomNightLockModel.insertMany(docs, { ordered: true });
        return {
          _id: holdRef.toString(),
          roomUnit: String(unit._id),
          unitNumber: unit.unitNumber,
          dateFrom,
          dateTo,
          nights,
        };
      } catch (err) {
        // Lost a night on this unit — remove partial inserts and try the next.
        await RoomNightLockModel.deleteMany({ holdRef });
        if ((err as { code?: number }).code !== 11000) throw err;
      }
    }
    throw ApiError.conflict('No rooms available for the selected dates');
  },

  /** Promotes a hold to a confirmed booking (after payment succeeds). */
  async confirmHold(holdRef: string, bookingRef: string) {
    const res = await RoomNightLockModel.updateMany(
      { holdRef: new Types.ObjectId(holdRef), kind: 'hold' },
      { $set: { kind: 'booking', bookingRef: new Types.ObjectId(bookingRef), expiresAt: null } },
    );
    if (res.matchedCount === 0)
      throw ApiError.conflict('Reservation hold expired before payment completed');
    return res.modifiedCount;
  },

  async releaseHold(holdRef: string) {
    await RoomNightLockModel.deleteMany({ holdRef: new Types.ObjectId(holdRef), kind: 'hold' });
  },

  /** Releases the nights held/booked by a booking (on cancellation). */
  async releaseBooking(bookingRef: string) {
    await RoomNightLockModel.deleteMany({ bookingRef: new Types.ObjectId(bookingRef) });
  },

  /**
   * Admin: block a unit (or every unit of a type) for a date range. Nights that
   * are already booked can't be blocked — they're reported back as conflicts.
   */
  async blockDates(input: {
    scope: 'unit' | 'roomType';
    roomUnit: string | null;
    roomType: string | null;
    dateFrom: Date;
    dateTo: Date;
    reason: string;
    note: string;
    actorId: string | null;
  }) {
    const nights = eachNight(input.dateFrom, input.dateTo);
    if (nights.length === 0) throw ApiError.badRequest('End date must be after start date');

    let units: { _id: Types.ObjectId; roomType: Types.ObjectId }[];
    if (input.scope === 'unit') {
      if (!input.roomUnit) throw ApiError.badRequest('roomUnit is required for unit scope');
      const u = await RoomUnitModel.findOne({ _id: input.roomUnit, isDeleted: false })
        .select('roomType')
        .lean();
      if (!u) throw ApiError.notFound('Room unit not found');
      units = [{ _id: u._id as Types.ObjectId, roomType: u.roomType as Types.ObjectId }];
    } else {
      if (!input.roomType) throw ApiError.badRequest('roomType is required for roomType scope');
      const list = await RoomUnitModel.find({ roomType: input.roomType, isDeleted: false })
        .select('roomType')
        .lean();
      units = list.map((u) => ({
        _id: u._id as Types.ObjectId,
        roomType: u.roomType as Types.ObjectId,
      }));
    }

    const blockRef = new Types.ObjectId();
    const docs = units.flatMap((u) =>
      nights.map((night) => ({
        roomUnit: u._id,
        roomType: u.roomType,
        night,
        kind: 'block' as const,
        blockRef,
        reason: input.reason || input.note,
        createdBy: input.actorId ? new Types.ObjectId(input.actorId) : null,
      })),
    );

    // ordered:false → insert every night that's free; collect the ones that clash.
    let blocked = 0;
    let conflicts = 0;
    try {
      const res = await RoomNightLockModel.insertMany(docs, { ordered: false });
      blocked = res.length;
    } catch (err) {
      const e = err as { insertedDocs?: unknown[]; writeErrors?: unknown[] };
      blocked = e.insertedDocs?.length ?? 0;
      conflicts = e.writeErrors?.length ?? 0;
    }
    return { blockRef: blockRef.toString(), blocked, conflicts, totalRequested: docs.length };
  },

  async releaseBlock(blockRef: string) {
    const res = await RoomNightLockModel.deleteMany({
      blockRef: new Types.ObjectId(blockRef),
      kind: 'block',
    });
    if (res.deletedCount === 0) throw ApiError.notFound('Block not found');
    return res.deletedCount;
  },

  /** Calendar view: occupancy for a unit/type within a window, grouped by night. */
  async calendar(filter: { roomUnit?: string; roomType?: string; dateFrom: Date; dateTo: Date }) {
    const nights = eachNight(filter.dateFrom, filter.dateTo);
    const query: Record<string, unknown> = { night: { $in: nights } };
    if (filter.roomUnit) query.roomUnit = new Types.ObjectId(filter.roomUnit);
    if (filter.roomType) query.roomType = new Types.ObjectId(filter.roomType);
    return RoomNightLockModel.find(query).sort({ night: 1 }).lean();
  },
};
