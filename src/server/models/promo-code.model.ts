import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { DISCOUNT_TYPE, type DiscountType } from '@/lib/constants';

export interface PromoCodeAttrs {
  code: string; // stored uppercase
  description: string;
  discountType: DiscountType;
  value: number; // percent or flat amount
  maxDiscount: number; // cap for percentage discounts (0 = uncapped)
  minNights: number;
  minAmount: number;
  usageLimit: number; // 0 = unlimited
  usedCount: number;
  perUserLimit: number; // 0 = unlimited
  validFrom: Date | null;
  validTo: Date | null;
  /** Empty = applies to all room types. */
  roomTypes: Types.ObjectId[];
  isActive: boolean;
}

const promoCodeSchema = createSchema<PromoCodeAttrs & BaseFields>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: Object.values(DISCOUNT_TYPE), required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0, min: 0 },
  minNights: { type: Number, default: 0, min: 0 },
  minAmount: { type: Number, default: 0, min: 0 },
  usageLimit: { type: Number, default: 0, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 0, min: 0 },
  validFrom: { type: Date, default: null },
  validTo: { type: Date, default: null },
  roomTypes: { type: [Schema.Types.ObjectId], ref: 'RoomType', default: [] },
  isActive: { type: Boolean, default: true, index: true },
});

export type PromoCodeDoc = HydratedDocument<PromoCodeAttrs & BaseFields>;
export const PromoCodeModel = defineModel<PromoCodeAttrs & BaseFields>(
  'PromoCode',
  promoCodeSchema,
);
