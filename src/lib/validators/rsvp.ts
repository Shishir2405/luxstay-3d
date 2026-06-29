import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common';
import { RSVP_STATUS, RSVP_TIER } from '@/lib/constants/enums';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

/* ── RSVPs ─────────────────────────────────────────────────────────────── */
const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).default(''),
});

export const rsvpCreateSchema = z.object({
  event: objectIdSchema.nullable().default(null),
  eventName: z.string().trim().max(160).default(''),
  contact: contactSchema,
  guestCount: z.number().int().min(1).max(50).default(1),
  tier: z.nativeEnum(RSVP_TIER).default(RSVP_TIER.GENERAL),
  specialRequests: z.string().trim().max(1000).default(''),
});
export type RsvpCreateInput = z.infer<typeof rsvpCreateSchema>;

export const rsvpUpdateSchema = z.object({
  eventName: z.string().trim().max(160).optional(),
  contact: contactSchema.partial().optional(),
  guestCount: z.number().int().min(1).max(50).optional(),
  tier: z.nativeEnum(RSVP_TIER).optional(),
  specialRequests: z.string().trim().max(1000).optional(),
  status: z.nativeEnum(RSVP_STATUS).optional(),
  tableReservation: objectIdSchema.nullable().optional(),
});
export type RsvpUpdateInput = z.infer<typeof rsvpUpdateSchema>;

export const rsvpListQuerySchema = paginationQuerySchema.extend({
  event: objectIdSchema.optional(),
  status: z.nativeEnum(RSVP_STATUS).optional(),
  tier: z.nativeEnum(RSVP_TIER).optional(),
});
export type RsvpListQuery = z.infer<typeof rsvpListQuerySchema>;

export const rsvpCheckInSchema = z.object({
  method: z.enum(['qr', 'manual', 'code']).default('manual'),
});
export type RsvpCheckInInput = z.infer<typeof rsvpCheckInSchema>;

/* ── Table layouts ─────────────────────────────────────────────────────── */
export const tableCreateSchema = z.object({
  name: z.string().trim().min(1).max(40),
  capacity: z.number().int().min(1).max(50).default(2),
  zone: z.string().trim().max(40).default('Main'),
  x: z.number().default(0),
  y: z.number().default(0),
  shape: z.enum(['round', 'square', 'rectangle', 'booth']).default('round'),
  isActive: z.boolean().default(true),
});
export type TableCreateInput = z.infer<typeof tableCreateSchema>;

export const tableUpdateSchema = tableCreateSchema.partial();
export type TableUpdateInput = z.infer<typeof tableUpdateSchema>;

export const tableListQuerySchema = paginationQuerySchema.extend({
  zone: z.string().trim().max(40).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});
export type TableListQuery = z.infer<typeof tableListQuerySchema>;

/** Reserved for future table-reservation creation flows. */
export const tableReservationCreateSchema = z.object({
  table: objectIdSchema,
  rsvp: objectIdSchema.nullable().default(null),
  event: objectIdSchema.nullable().default(null),
  date: dateSchema,
  timeSlot: z.string().trim().max(40).default(''),
  partySize: z.number().int().min(1).max(50).default(2),
});
export type TableReservationCreateInput = z.infer<typeof tableReservationCreateSchema>;
