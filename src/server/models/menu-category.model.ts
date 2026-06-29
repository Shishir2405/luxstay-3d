import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

/** Whether a category groups food dishes or drinks. */
const MENU_CATEGORY_KIND = ['Food', 'Drink'] as const;
export type MenuCategoryKind = (typeof MENU_CATEGORY_KIND)[number];

export interface MenuCategoryAttrs {
  name: string;
  slug: string;
  description: string;
  kind: MenuCategoryKind;
  sortOrder: number;
  isActive: boolean;
}

const menuCategorySchema = createSchema<MenuCategoryAttrs & BaseFields>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  kind: { type: String, enum: MENU_CATEGORY_KIND, default: 'Food', index: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

export type MenuCategoryDoc = HydratedDocument<MenuCategoryAttrs & BaseFields>;
export const MenuCategoryModel = defineModel<MenuCategoryAttrs & BaseFields>(
  'MenuCategory',
  menuCategorySchema,
);
