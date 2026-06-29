import { z } from 'zod';
import { paginationQuerySchema } from './common';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

/* ── Media assets ──────────────────────────────────────────────────────── */
export const mediaCreateSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video']).default('image'),
  alt: z.string().trim().max(200).default(''),
  title: z.string().trim().max(200).default(''),
  folder: z.string().trim().max(60).default('general'),
  sizeBytes: z.number().int().min(0).default(0),
  width: z.number().int().min(0).default(0),
  height: z.number().int().min(0).default(0),
});
export const mediaUpdateSchema = mediaCreateSchema.partial();
export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;

export const mediaListQuerySchema = paginationQuerySchema.extend({
  type: z.enum(['image', 'video']).optional(),
  folder: z.string().trim().max(60).optional(),
});
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

/* ── Content blocks ────────────────────────────────────────────────────── */
export const contentBlockCreateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_-]+$/, 'Letters, numbers, - and _ only'),
  title: z.string().trim().max(160).default(''),
  body: z.string().max(50000).default(''),
  locale: z.string().trim().min(2).max(10).default('en'),
  isPublished: z.boolean().default(false),
});
export const contentBlockUpdateSchema = contentBlockCreateSchema.partial();
export type ContentBlockCreateInput = z.infer<typeof contentBlockCreateSchema>;

export const contentBlockListQuerySchema = paginationQuerySchema.extend({
  locale: z.string().trim().max(10).optional(),
  isPublished: z.enum(['true', 'false']).optional(),
});
export type ContentBlockListQuery = z.infer<typeof contentBlockListQuerySchema>;

/* ── Banners ───────────────────────────────────────────────────────────── */
export const bannerCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    imageUrl: z.string().url(),
    linkUrl: z.string().url().or(z.literal('')).default(''),
    placement: z.string().trim().max(60).default('home-hero'),
    startAt: dateSchema.nullable().default(null),
    endAt: dateSchema.nullable().default(null),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  })
  .refine((v) => !(v.startAt && v.endAt) || new Date(v.startAt) <= new Date(v.endAt), {
    message: 'startAt must be on or before endAt',
    path: ['endAt'],
  });
export const bannerUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    imageUrl: z.string().url().optional(),
    linkUrl: z.string().url().or(z.literal('')).optional(),
    placement: z.string().trim().max(60).optional(),
    startAt: dateSchema.nullable().optional(),
    endAt: dateSchema.nullable().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => !(v.startAt && v.endAt) || new Date(v.startAt) <= new Date(v.endAt), {
    message: 'startAt must be on or before endAt',
    path: ['endAt'],
  });
export type BannerCreateInput = z.infer<typeof bannerCreateSchema>;
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;

export const bannerListQuerySchema = paginationQuerySchema.extend({
  placement: z.string().trim().max(60).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  /** When 'true', return only banners currently within their schedule window. */
  active: z.enum(['true', 'false']).optional(),
});
export type BannerListQuery = z.infer<typeof bannerListQuerySchema>;

/* ── SEO metadata ──────────────────────────────────────────────────────── */
export const seoCreateSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^\/[A-Za-z0-9/_-]*$/, 'Path must start with / and be URL-safe'),
  title: z.string().trim().max(200).default(''),
  description: z.string().trim().max(500).default(''),
  ogImage: z.string().url().or(z.literal('')).default(''),
  locale: z.string().trim().min(2).max(10).default('en'),
});
export const seoUpdateSchema = seoCreateSchema.partial();
export type SeoCreateInput = z.infer<typeof seoCreateSchema>;

export const seoListQuerySchema = paginationQuerySchema.extend({
  locale: z.string().trim().max(10).optional(),
});
export type SeoListQuery = z.infer<typeof seoListQuerySchema>;
