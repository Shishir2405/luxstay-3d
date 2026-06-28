import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { PRICING_RULE_KIND, type PricingRuleKind } from '@/lib/constants';

/** How the rule changes the base nightly price. */
export type PriceAdjustType = 'percent' | 'amount' | 'fixed';

export interface PricingRuleAttrs {
  name: string;
  kind: PricingRuleKind;
  /** Empty = applies to all room types. */
  roomType: Types.ObjectId | null;

  // Seasonal/holiday windows
  dateFrom: Date | null;
  dateTo: Date | null;
  /** For weekend rules: 0 (Sun) – 6 (Sat). */
  daysOfWeek: number[];

  adjustType: PriceAdjustType; // percent: +/-N% · amount: +/-N · fixed: set to N
  value: number;

  priority: number; // higher wins on overlap
  isActive: boolean;
}

const pricingRuleSchema = createSchema<PricingRuleAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  kind: { type: String, enum: Object.values(PRICING_RULE_KIND), required: true, index: true },
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', default: null, index: true },

  dateFrom: { type: Date, default: null },
  dateTo: { type: Date, default: null },
  daysOfWeek: { type: [Number], default: [] },

  adjustType: { type: String, enum: ['percent', 'amount', 'fixed'], default: 'percent' },
  value: { type: Number, required: true },

  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
});

export type PricingRuleDoc = HydratedDocument<PricingRuleAttrs & BaseFields>;
export const PricingRuleModel = defineModel<PricingRuleAttrs & BaseFields>(
  'PricingRule',
  pricingRuleSchema,
);
