import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface LoyaltyTransactionAttrs {
  user: Types.ObjectId;
  /** Signed delta: positive accrual, negative redemption. */
  points: number;
  reason: string;
  booking: Types.ObjectId | null;
  /** Guest's loyalty balance immediately after this transaction. */
  balanceAfter: number;
}

const loyaltyTransactionSchema = createSchema<LoyaltyTransactionAttrs & BaseFields>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  points: { type: Number, required: true },
  reason: { type: String, required: true, trim: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
  balanceAfter: { type: Number, required: true },
});

export type LoyaltyTransactionDoc = HydratedDocument<LoyaltyTransactionAttrs & BaseFields>;
export const LoyaltyTransactionModel = defineModel<LoyaltyTransactionAttrs & BaseFields>(
  'LoyaltyTransaction',
  loyaltyTransactionSchema,
);
