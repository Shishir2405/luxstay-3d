import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common';
import { REVIEW_STATUS } from '@/lib/constants/enums';

/* ── Reviews ───────────────────────────────────────────────────────────── */
export const reviewCreateSchema = z.object({
  roomType: objectIdSchema.nullable().default(null),
  booking: objectIdSchema.nullable().default(null),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(160).default(''),
  body: z.string().trim().min(2).max(4000),
});
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

export const reviewModerateSchema = z.object({
  status: z.nativeEnum(REVIEW_STATUS),
  isPublic: z.boolean().optional(),
});
export type ReviewModerateInput = z.infer<typeof reviewModerateSchema>;

export const reviewListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(REVIEW_STATUS).optional(),
  roomType: objectIdSchema.optional(),
});
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;

/* ── Wishlist ──────────────────────────────────────────────────────────── */
export const wishlistAddSchema = z.object({
  roomType: objectIdSchema,
});
export type WishlistAddInput = z.infer<typeof wishlistAddSchema>;
