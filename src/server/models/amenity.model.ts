import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface AmenityAttrs {
  name: string;
  slug: string;
  /** Phosphor icon name rendered in the UI, e.g. 'WifiHigh'. */
  icon: string;
  category: string; // 'Connectivity' | 'Comfort' | 'View' | 'Bathroom' | …
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const amenitySchema = createSchema<AmenityAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  icon: { type: String, default: 'Sparkle' },
  category: { type: String, default: 'General', index: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
});

export type AmenityDoc = HydratedDocument<AmenityAttrs & BaseFields>;
export const AmenityModel = defineModel<AmenityAttrs & BaseFields>('Amenity', amenitySchema);
