import 'server-only';
import mongoose, { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { RSVP_STATUS, RSVP_TIER, type RsvpStatus, type RsvpTier } from '@/lib/constants/enums';

export interface RsvpContact {
  name: string;
  email: string;
  phone: string;
}

export interface RsvpAttrs {
  event: mongoose.Types.ObjectId | null;
  eventName: string;
  code: string;
  contact: RsvpContact;
  guestCount: number;
  tier: RsvpTier;
  specialRequests: string;
  status: RsvpStatus;
  qrToken: string;
  tableReservation: mongoose.Types.ObjectId | null;
  user: mongoose.Types.ObjectId | null;
  checkedInAt: Date | null;
}

const contactSchema = new Schema<RsvpContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
  },
  { _id: false },
);

const rsvpSchema = createSchema<RsvpAttrs & BaseFields>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
  eventName: { type: String, default: '', trim: true },
  code: { type: String, required: true, unique: true, index: true },
  contact: { type: contactSchema, required: true },
  guestCount: { type: Number, default: 1, min: 1 },
  tier: { type: String, enum: Object.values(RSVP_TIER), default: RSVP_TIER.GENERAL, index: true },
  specialRequests: { type: String, default: '' },
  status: {
    type: String,
    enum: Object.values(RSVP_STATUS),
    default: RSVP_STATUS.PENDING,
    index: true,
  },
  qrToken: { type: String, required: true, index: true },
  tableReservation: { type: Schema.Types.ObjectId, ref: 'TableReservation', default: null },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  checkedInAt: { type: Date, default: null },
});

export type RsvpDoc = HydratedDocument<RsvpAttrs & BaseFields>;
export const RsvpModel = defineModel<RsvpAttrs & BaseFields>('Rsvp', rsvpSchema);
