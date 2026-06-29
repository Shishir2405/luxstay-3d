import { z } from 'zod';
import { objectIdSchema, moneySchema, paginationQuerySchema } from './common';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

const MENU_CATEGORY_KIND = ['Food', 'Drink'] as const;
const DIETARY_TAG = ['vegetarian', 'vegan', 'gluten-free'] as const;
const OFFER_KIND = ['HappyHour', 'Combo'] as const;

/* ── Menu categories ───────────────────────────────────────────────────── */
export const menuCategoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).default(''),
  kind: z.enum(MENU_CATEGORY_KIND).default('Food'),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const menuCategoryUpdateSchema = menuCategoryCreateSchema.partial();
export type MenuCategoryCreateInput = z.infer<typeof menuCategoryCreateSchema>;

export const menuCategoryListQuerySchema = paginationQuerySchema.extend({
  kind: z.enum(MENU_CATEGORY_KIND).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type MenuCategoryListQuery = z.infer<typeof menuCategoryListQuerySchema>;

/* ── Menu items ────────────────────────────────────────────────────────── */
export const menuItemCreateSchema = z.object({
  category: objectIdSchema,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(800).default(''),
  price: moneySchema,
  imageUrl: z.string().url().or(z.literal('')).default(''),
  dietaryTags: z.array(z.enum(DIETARY_TAG)).default([]),
  spiceLevel: z.number().int().min(0).max(3).default(0),
  isAvailable: z.boolean().default(true),
  isSeasonal: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});
export const menuItemUpdateSchema = menuItemCreateSchema.partial();
export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;

export const menuItemListQuerySchema = paginationQuerySchema.extend({
  category: objectIdSchema.optional(),
  isAvailable: z.enum(['true', 'false']).optional(),
  isSeasonal: z.enum(['true', 'false']).optional(),
});
export type MenuItemListQuery = z.infer<typeof menuItemListQuerySchema>;

export const menuItemAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});
export type MenuItemAvailabilityInput = z.infer<typeof menuItemAvailabilitySchema>;

/* ── Offers ────────────────────────────────────────────────────────────── */
export const offerCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(800).default(''),
    kind: z.enum(OFFER_KIND).default('HappyHour'),
    discountText: z.string().trim().max(120).default(''),
    startAt: dateSchema.nullable().default(null),
    endAt: dateSchema.nullable().default(null),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
    isActive: z.boolean().default(true),
  })
  .refine((v) => !(v.startAt && v.endAt) || new Date(v.startAt) <= new Date(v.endAt), {
    message: 'startAt must be on or before endAt',
    path: ['endAt'],
  });
export const offerUpdateSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(800).optional(),
  kind: z.enum(OFFER_KIND).optional(),
  discountText: z.string().trim().max(120).optional(),
  startAt: dateSchema.nullable().optional(),
  endAt: dateSchema.nullable().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  isActive: z.boolean().optional(),
});
export type OfferCreateInput = z.infer<typeof offerCreateSchema>;

export const offerListQuerySchema = paginationQuerySchema.extend({
  kind: z.enum(OFFER_KIND).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type OfferListQuery = z.infer<typeof offerListQuerySchema>;
