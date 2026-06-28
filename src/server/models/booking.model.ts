import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type BookingStatus,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/constants';

export interface BookedRoom {
  roomType: Types.ObjectId;
  roomTypeName: string;
  roomUnit: Types.ObjectId;
  unitNumber: string;
  dateFrom: Date;
  dateTo: Date;
  nights: number;
  adults: number;
  children: number;
  perNight: { date: string; price: number }[];
  subtotal: number;
  /** Ref to the RoomNightLock hold/booking group for this room. */
  holdRef: Types.ObjectId;
}

export interface StatusEvent {
  status: BookingStatus;
  at: Date;
  note: string;
  byName: string;
}

export interface BookingAttrs {
  bookingRef: string; // human code e.g. LX-7F3K9Q
  user: Types.ObjectId | null;
  contact: { name: string; email: string; phone: string };
  rooms: BookedRoom[];
  status: BookingStatus;
  statusTimeline: StatusEvent[];

  pricing: {
    roomsSubtotal: number;
    discount: number;
    promoCode: string | null;
    taxes: number;
    total: number;
    currency: string;
  };

  payment: {
    type: PaymentType;
    depositAmount: number;
    amountPaid: number;
    amountDue: number;
    status: PaymentStatus;
  };

  source: 'web' | 'admin';
  specialRequests: string;

  cancellation: {
    cancelledAt: Date | null;
    reason: string;
    refundAmount: number;
  } | null;
}

const bookedRoomSchema = new Schema<BookedRoom>(
  {
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomTypeName: { type: String, default: '' },
    roomUnit: { type: Schema.Types.ObjectId, ref: 'RoomUnit', required: true },
    unitNumber: { type: String, default: '' },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    nights: { type: Number, required: true },
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },
    perNight: { type: [{ date: String, price: Number }], default: [] },
    subtotal: { type: Number, required: true },
    holdRef: { type: Schema.Types.ObjectId, required: true },
  },
  { _id: false },
);

const statusEventSchema = new Schema<StatusEvent>(
  {
    status: { type: String, enum: Object.values(BOOKING_STATUS), required: true },
    at: { type: Date, default: () => new Date() },
    note: { type: String, default: '' },
    byName: { type: String, default: 'system' },
  },
  { _id: false },
);

const bookingSchema = createSchema<BookingAttrs & BaseFields>({
  bookingRef: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
  },
  rooms: { type: [bookedRoomSchema], default: [] },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
    index: true,
  },
  statusTimeline: { type: [statusEventSchema], default: [] },

  pricing: {
    roomsSubtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: null },
    taxes: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },

  payment: {
    type: { type: String, enum: Object.values(PAYMENT_TYPE), default: PAYMENT_TYPE.FULL },
    depositAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.CREATED },
  },

  source: { type: String, enum: ['web', 'admin'], default: 'web' },
  specialRequests: { type: String, default: '' },

  cancellation: {
    type: {
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
    },
    default: null,
  },
});

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'contact.email': 1, status: 1 });

export type BookingDoc = HydratedDocument<BookingAttrs & BaseFields>;
export const BookingModel = defineModel<BookingAttrs & BaseFields>('Booking', bookingSchema);
