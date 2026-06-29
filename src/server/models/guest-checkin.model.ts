import 'server-only';
import mongoose, { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

const CHECKIN_METHOD = ['qr', 'manual', 'code'] as const;
type CheckinMethod = (typeof CHECKIN_METHOD)[number];

export interface GuestCheckinAttrs {
  rsvp: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId | null;
  checkedInBy: string;
  at: Date;
  method: CheckinMethod;
}

const guestCheckinSchema = createSchema<GuestCheckinAttrs & BaseFields>({
  rsvp: { type: Schema.Types.ObjectId, ref: 'Rsvp', required: true, index: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  checkedInBy: { type: String, default: '', trim: true },
  at: { type: Date, default: () => new Date() },
  method: { type: String, enum: CHECKIN_METHOD, default: 'manual' },
});

export type GuestCheckinDoc = HydratedDocument<GuestCheckinAttrs & BaseFields>;
export const GuestCheckinModel = defineModel<GuestCheckinAttrs & BaseFields>(
  'GuestCheckin',
  guestCheckinSchema,
);
