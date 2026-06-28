import { z } from 'zod';
import { objectIdSchema, moneySchema, paginationQuerySchema } from './common';
import { ROOM_UNIT_STATUS, PRICING_RULE_KIND, DISCOUNT_TYPE } from '@/lib/constants/enums';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

/* ── Amenities ─────────────────────────────────────────────────────────── */
export const amenityCreateSchema = z.object({
  name: z.string().trim().min(2).max(60),
  icon: z.string().trim().max(40).default('Sparkle'),
  category: z.string().trim().max(40).default('General'),
  description: z.string().trim().max(200).default(''),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export const amenityUpdateSchema = amenityCreateSchema.partial();
export type AmenityCreateInput = z.infer<typeof amenityCreateSchema>;

/* ── Room types ────────────────────────────────────────────────────────── */
const roomImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(160).default(''),
  sortOrder: z.number().int().default(0),
});

export const roomTypeCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(4000).default(''),
  shortDescription: z.string().trim().max(280).default(''),
  basePrice: moneySchema,
  currency: z.string().length(3).default('INR'),
  maxAdults: z.number().int().min(1).max(20).default(2),
  maxChildren: z.number().int().min(0).max(20).default(1),
  extraBeds: z.number().int().min(0).max(10).default(0),
  extraBedPrice: moneySchema.default(0),
  childPolicy: z.string().max(400).default('Children under 6 stay free.'),
  sizeSqft: z.number().min(0).max(100000).default(0),
  bedType: z.string().max(40).default('King'),
  view: z.string().max(40).default(''),
  amenities: z.array(objectIdSchema).default([]),
  images: z.array(roomImageSchema).max(30).default([]),
  model3dUrl: z.string().url().or(z.literal('')).default(''),
  model3dPoster: z.string().url().or(z.literal('')).default(''),
  comparisonFields: z
    .array(z.string())
    .default(['basePrice', 'maxAdults', 'sizeSqft', 'bedType', 'view']),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});
export const roomTypeUpdateSchema = roomTypeCreateSchema.partial();
export type RoomTypeCreateInput = z.infer<typeof roomTypeCreateSchema>;

export const roomTypeListQuerySchema = paginationQuerySchema.extend({
  isActive: z.enum(['true', 'false']).optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
});

/* ── Room inventory units ──────────────────────────────────────────────── */
export const roomUnitCreateSchema = z.object({
  roomType: objectIdSchema,
  unitNumber: z.string().trim().min(1).max(20),
  floor: z.number().int().default(1),
  status: z.nativeEnum(ROOM_UNIT_STATUS).default(ROOM_UNIT_STATUS.AVAILABLE),
  notes: z.string().max(400).default(''),
});
export const roomUnitUpdateSchema = roomUnitCreateSchema.partial().omit({ roomType: true });

export const roomUnitStatusSchema = z.object({
  status: z.nativeEnum(ROOM_UNIT_STATUS),
  reason: z.string().max(200).default(''),
});

export const roomUnitListQuerySchema = paginationQuerySchema.extend({
  roomType: objectIdSchema.optional(),
  status: z.nativeEnum(ROOM_UNIT_STATUS).optional(),
});

/* ── Pricing rules ─────────────────────────────────────────────────────── */
export const pricingRuleCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    kind: z.nativeEnum(PRICING_RULE_KIND),
    roomType: objectIdSchema.nullable().default(null),
    dateFrom: dateSchema.nullable().default(null),
    dateTo: dateSchema.nullable().default(null),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
    adjustType: z.enum(['percent', 'amount', 'fixed']).default('percent'),
    value: z.number(),
    priority: z.number().int().default(0),
    isActive: z.boolean().default(true),
  })
  .refine((v) => !(v.dateFrom && v.dateTo) || new Date(v.dateFrom) <= new Date(v.dateTo), {
    message: 'dateFrom must be on or before dateTo',
    path: ['dateTo'],
  });
export const pricingRuleUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  kind: z.nativeEnum(PRICING_RULE_KIND).optional(),
  roomType: objectIdSchema.nullable().optional(),
  dateFrom: dateSchema.nullable().optional(),
  dateTo: dateSchema.nullable().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  adjustType: z.enum(['percent', 'amount', 'fixed']).optional(),
  value: z.number().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/* ── Availability blocking ─────────────────────────────────────────────── */
export const blockDatesSchema = z
  .object({
    scope: z.enum(['unit', 'roomType']).default('unit'),
    roomUnit: objectIdSchema.nullable().default(null),
    roomType: objectIdSchema.nullable().default(null),
    dateFrom: dateSchema,
    dateTo: dateSchema,
    reason: z.enum(['maintenance', 'blocked', 'hold']).default('blocked'),
    note: z.string().max(300).default(''),
  })
  .refine((v) => new Date(v.dateFrom) < new Date(v.dateTo), {
    message: 'dateTo must be after dateFrom',
    path: ['dateTo'],
  })
  .refine((v) => (v.scope === 'unit' ? Boolean(v.roomUnit) : Boolean(v.roomType)), {
    message: 'Provide the matching room unit or room type for the chosen scope',
    path: ['scope'],
  });

export const availabilityQuerySchema = z.object({
  dateFrom: dateSchema,
  dateTo: dateSchema,
});

/* ── Promo codes ───────────────────────────────────────────────────────── */
export const promoCodeCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, - and _ only'),
  description: z.string().max(200).default(''),
  discountType: z.nativeEnum(DISCOUNT_TYPE),
  value: z.number().min(0),
  maxDiscount: z.number().min(0).default(0),
  minNights: z.number().int().min(0).default(0),
  minAmount: z.number().min(0).default(0),
  usageLimit: z.number().int().min(0).default(0),
  perUserLimit: z.number().int().min(0).default(0),
  validFrom: dateSchema.nullable().default(null),
  validTo: dateSchema.nullable().default(null),
  roomTypes: z.array(objectIdSchema).default([]),
  isActive: z.boolean().default(true),
});
export const promoCodeUpdateSchema = promoCodeCreateSchema.partial();
