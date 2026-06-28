import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type PaymentStatus,
  type PaymentType,
} from '@/lib/constants';

export interface RefundRecord {
  razorpayRefundId: string;
  amount: number;
  status: string;
  reason: string;
  at: Date;
}

export interface PaymentTransactionAttrs {
  booking: Types.ObjectId;
  bookingRef: string;
  provider: string; // 'razorpay'

  // Razorpay correlation IDs — stored for audit/dispute resolution (PRD §4.4).
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;

  amount: number; // major units
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  method: string;
  errorMessage: string;

  refunds: RefundRecord[];
  /** Snapshot of the verified webhook payload. */
  raw: unknown;
}

const refundSchema = new Schema<RefundRecord>(
  {
    razorpayRefundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'processed' },
    reason: { type: String, default: '' },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const paymentSchema = createSchema<PaymentTransactionAttrs & BaseFields>({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  bookingRef: { type: String, default: '' },
  provider: { type: String, default: 'razorpay' },

  razorpayOrderId: { type: String, required: true, index: true },
  razorpayPaymentId: { type: String, default: null, index: true },
  razorpaySignature: { type: String, default: null },

  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: Object.values(PAYMENT_TYPE), default: PAYMENT_TYPE.FULL },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.CREATED,
    index: true,
  },
  method: { type: String, default: '' },
  errorMessage: { type: String, default: '' },

  refunds: { type: [refundSchema], default: [] },
  raw: { type: Schema.Types.Mixed, default: null },
});

export type PaymentTransactionDoc = HydratedDocument<PaymentTransactionAttrs & BaseFields>;
export const PaymentTransactionModel = defineModel<PaymentTransactionAttrs & BaseFields>(
  'PaymentTransaction',
  paymentSchema,
);
