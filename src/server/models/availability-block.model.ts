import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export type BlockReason = 'maintenance' | 'blocked' | 'booking' | 'hold';

export interface AvailabilityBlockAttrs {
  scope: 'unit' | 'roomType';
  roomUnit: Types.ObjectId | null;
  roomType: Types.ObjectId | null;
  /** Inclusive start (check-in), exclusive end (check-out) — date-only semantics. */
  dateFrom: Date;
  dateTo: Date;
  reason: BlockReason;
  /** Set when reason='booking' or 'hold'. */
  bookingRef: Types.ObjectId | null;
  /** Short-lived checkout holds expire; null for permanent blocks. */
  expiresAt: Date | null;
  note: string;
}

const availabilityBlockSchema = createSchema<AvailabilityBlockAttrs & BaseFields>({
  scope: { type: String, enum: ['unit', 'roomType'], required: true },
  roomUnit: { type: Schema.Types.ObjectId, ref: 'RoomUnit', default: null, index: true },
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', default: null, index: true },
  dateFrom: { type: Date, required: true, index: true },
  dateTo: { type: Date, required: true, index: true },
  reason: { type: String, enum: ['maintenance', 'blocked', 'booking', 'hold'], required: true },
  bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
  expiresAt: { type: Date, default: null },
  note: { type: String, default: '' },
});

// TTL index: holds with an expiresAt are auto-released by Mongo once elapsed.
availabilityBlockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
availabilityBlockSchema.index({ roomUnit: 1, dateFrom: 1, dateTo: 1 });

export type AvailabilityBlockDoc = HydratedDocument<AvailabilityBlockAttrs & BaseFields>;
export const AvailabilityBlockModel = defineModel<AvailabilityBlockAttrs & BaseFields>(
  'AvailabilityBlock',
  availabilityBlockSchema,
);
