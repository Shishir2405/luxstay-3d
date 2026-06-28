import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { ROOM_UNIT_STATUS, type RoomUnitStatus } from '@/lib/constants';

export interface UnitStatusChange {
  status: RoomUnitStatus;
  reason: string;
  at: Date;
  byName: string;
}

export interface RoomUnitAttrs {
  roomType: Types.ObjectId;
  unitNumber: string; // "101"
  floor: number;
  status: RoomUnitStatus;
  statusHistory: UnitStatusChange[];
  notes: string;
  isActive: boolean;
}

const statusChangeSchema = new Schema<UnitStatusChange>(
  {
    status: { type: String, enum: Object.values(ROOM_UNIT_STATUS), required: true },
    reason: { type: String, default: '' },
    at: { type: Date, default: () => new Date() },
    byName: { type: String, default: 'system' },
  },
  { _id: false },
);

const roomUnitSchema = createSchema<RoomUnitAttrs & BaseFields>({
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
  unitNumber: { type: String, required: true, trim: true },
  floor: { type: Number, default: 1 },
  status: {
    type: String,
    enum: Object.values(ROOM_UNIT_STATUS),
    default: ROOM_UNIT_STATUS.AVAILABLE,
    index: true,
  },
  statusHistory: { type: [statusChangeSchema], default: [] },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

// A unit number is unique within a room type.
roomUnitSchema.index({ roomType: 1, unitNumber: 1 }, { unique: true });

export type RoomUnitDoc = HydratedDocument<RoomUnitAttrs & BaseFields>;
export const RoomUnitModel = defineModel<RoomUnitAttrs & BaseFields>('RoomUnit', roomUnitSchema);
