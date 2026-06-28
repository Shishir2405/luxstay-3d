import 'server-only';
import mongoose, { Schema, type Types, type InferSchemaType, type Model } from 'mongoose';

/**
 * Per-night occupancy ledger — the atomic source of truth for room availability.
 *
 * One document per (roomUnit, night). The UNIQUE index on (roomUnit, night) is
 * what makes overbooking impossible: two concurrent checkouts racing for the
 * same unit+night can't both insert — the DB rejects the second with a duplicate
 * key error. This is the only race-free option on a standalone mongod (no
 * multi-doc transactions). Rows are HARD-deleted on release so the slot frees up
 * (hence no soft-delete base schema — a tombstone would keep the unique slot
 * occupied).
 */
const roomNightLockSchema = new Schema(
  {
    roomUnit: { type: Schema.Types.ObjectId, ref: 'RoomUnit', required: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
    /** UTC date-only key 'YYYY-MM-DD'. */
    night: { type: String, required: true },
    kind: { type: String, enum: ['hold', 'booking', 'block'], required: true },
    /** Groups all nights of one checkout hold. */
    holdRef: { type: Schema.Types.ObjectId, default: null, index: true },
    bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
    /** Groups all nights of one admin block (maintenance/blocked). */
    blockRef: { type: Schema.Types.ObjectId, default: null, index: true },
    reason: { type: String, default: '' },
    /** Holds carry a TTL; Mongo auto-releases expired holds. Bookings/blocks: null. */
    expiresAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

// Atomic overbooking guard.
roomNightLockSchema.index({ roomUnit: 1, night: 1 }, { unique: true });
roomNightLockSchema.index({ roomType: 1, night: 1 });
// TTL: expired holds vanish automatically (bookings/blocks have expiresAt=null).
roomNightLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RoomNightLockAttrs = InferSchemaType<typeof roomNightLockSchema>;
export type RoomNightLockDoc = mongoose.HydratedDocument<RoomNightLockAttrs>;

export const RoomNightLockModel: Model<RoomNightLockAttrs> =
  (mongoose.models.RoomNightLock as Model<RoomNightLockAttrs>) ??
  mongoose.model('RoomNightLock', roomNightLockSchema);

export type NightLockObjectId = Types.ObjectId;
