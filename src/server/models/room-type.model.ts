import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface RoomImage {
  url: string;
  alt: string;
  sortOrder: number;
}

export interface RoomTypeAttrs {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;

  basePrice: number; // per night, major currency units
  currency: string;

  // Occupancy rules
  maxAdults: number;
  maxChildren: number;
  extraBeds: number;
  extraBedPrice: number;
  childPolicy: string;

  // Specs
  sizeSqft: number;
  bedType: string; // 'King' | 'Twin' | …
  view: string; // 'Sea' | 'City' | 'Garden' | …

  amenities: Types.ObjectId[];

  // Media + 3D asset (assigned per room type; .glb named by roomType id)
  images: RoomImage[];
  model3dUrl: string;
  model3dPoster: string;

  /** Fields surfaced in the public "compare rooms" table. */
  comparisonFields: string[];

  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

const imageSchema = new Schema<RoomImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const roomTypeSchema = createSchema<RoomTypeAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },

  basePrice: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },

  maxAdults: { type: Number, default: 2, min: 1 },
  maxChildren: { type: Number, default: 1, min: 0 },
  extraBeds: { type: Number, default: 0, min: 0 },
  extraBedPrice: { type: Number, default: 0, min: 0 },
  childPolicy: { type: String, default: 'Children under 6 stay free.' },

  sizeSqft: { type: Number, default: 0 },
  bedType: { type: String, default: 'King' },
  view: { type: String, default: '' },

  amenities: { type: [Schema.Types.ObjectId], ref: 'Amenity', default: [] },

  images: { type: [imageSchema], default: [] },
  model3dUrl: { type: String, default: '' },
  model3dPoster: { type: String, default: '' },

  comparisonFields: {
    type: [String],
    default: ['basePrice', 'maxAdults', 'sizeSqft', 'bedType', 'view'],
  },

  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

roomTypeSchema.index({ name: 'text', description: 'text' });

export type RoomTypeDoc = HydratedDocument<RoomTypeAttrs & BaseFields>;
export const RoomTypeModel = defineModel<RoomTypeAttrs & BaseFields>('RoomType', roomTypeSchema);
