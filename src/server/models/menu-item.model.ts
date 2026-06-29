import 'server-only';
import mongoose, { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

/** Dietary suitability tags shown as badges on the menu. */
const DIETARY_TAG = ['vegetarian', 'vegan', 'gluten-free'] as const;
export type DietaryTag = (typeof DIETARY_TAG)[number];

export interface MenuItemAttrs {
  category: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  dietaryTags: DietaryTag[];
  /** 0 = none … 3 = very hot. */
  spiceLevel: number;
  /** Sold-out toggle for service staff. */
  isAvailable: boolean;
  isSeasonal: boolean;
  sortOrder: number;
}

const menuItemSchema = createSchema<MenuItemAttrs & BaseFields>({
  category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  dietaryTags: { type: [String], enum: DIETARY_TAG, default: [] },
  spiceLevel: { type: Number, default: 0, min: 0, max: 3 },
  isAvailable: { type: Boolean, default: true },
  isSeasonal: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

export type MenuItemDoc = HydratedDocument<MenuItemAttrs & BaseFields>;
export const MenuItemModel = defineModel<MenuItemAttrs & BaseFields>('MenuItem', menuItemSchema);
