import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface BannerAttrs {
  title: string;
  imageUrl: string;
  linkUrl: string;
  /** Placement slot, e.g. 'home-hero', 'bar-promo'. */
  placement: string;
  /** Scheduling window; null endAt means open-ended. */
  startAt?: Date | null;
  endAt?: Date | null;
  sortOrder: number;
  isActive: boolean;
}

const bannerSchema = createSchema<BannerAttrs & BaseFields>({
  title: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  linkUrl: { type: String, default: '', trim: true },
  placement: { type: String, default: 'home-hero', index: true },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
});

export type BannerDoc = HydratedDocument<BannerAttrs & BaseFields>;
export const BannerModel = defineModel<BannerAttrs & BaseFields>('Banner', bannerSchema);
