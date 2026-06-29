import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

/** Kind of lounge promotion. */
const OFFER_KIND = ['HappyHour', 'Combo'] as const;
export type OfferKind = (typeof OFFER_KIND)[number];

export interface OfferAttrs {
  title: string;
  description: string;
  kind: OfferKind;
  /** Human-readable discount, e.g. '2-for-1 cocktails' or '20% off'. */
  discountText: string;
  startAt: Date | null;
  endAt: Date | null;
  /** Days the offer runs (0 = Sunday … 6 = Saturday). */
  daysOfWeek: number[];
  isActive: boolean;
}

const offerSchema = createSchema<OfferAttrs & BaseFields>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  kind: { type: String, enum: OFFER_KIND, default: 'HappyHour', index: true },
  discountText: { type: String, default: '' },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  daysOfWeek: { type: [Number], default: [] },
  isActive: { type: Boolean, default: true },
});

export type OfferDoc = HydratedDocument<OfferAttrs & BaseFields>;
export const OfferModel = defineModel<OfferAttrs & BaseFields>('Offer', offerSchema);
