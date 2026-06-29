import { z } from 'zod';
import { objectIdSchema, moneySchema, paginationQuerySchema } from './common';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

const EVENT_STATUS = ['draft', 'scheduled', 'live', 'completed', 'cancelled'] as const;
const EVENT_TYPE = ['party', 'concert', 'dj-night', 'private', 'corporate', 'special'] as const;

const eventMediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(160).default(''),
  sortOrder: z.number().int().default(0),
});

const eventTierSchema = z.object({
  name: z.string().trim().min(1).max(60),
  price: moneySchema.default(0),
  perks: z.array(z.string().trim().max(120)).default([]),
  capacity: z.number().int().min(0).default(0),
});

export const eventCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(140),
    description: z.string().trim().max(8000).default(''),
    type: z.enum(EVENT_TYPE).default('party'),
    bannerUrl: z.string().url().or(z.literal('')).default(''),
    media: z.array(eventMediaSchema).max(30).default([]),
    startAt: dateSchema,
    endAt: dateSchema,
    venue: z.string().trim().max(160).default(''),
    capacity: z.number().int().min(0).default(0),
    tiers: z.array(eventTierSchema).max(20).default([]),
    isRecurring: z.boolean().default(false),
    recurrenceRule: z.string().trim().max(60).default(''),
    djLineup: z.array(z.string().trim().max(120)).default([]),
    status: z.enum(EVENT_STATUS).default('draft'),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

export const eventUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(140).optional(),
    description: z.string().trim().max(8000).optional(),
    type: z.enum(EVENT_TYPE).optional(),
    bannerUrl: z.string().url().or(z.literal('')).optional(),
    media: z.array(eventMediaSchema).max(30).optional(),
    startAt: dateSchema.optional(),
    endAt: dateSchema.optional(),
    venue: z.string().trim().max(160).optional(),
    capacity: z.number().int().min(0).optional(),
    tiers: z.array(eventTierSchema).max(20).optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().trim().max(60).optional(),
    djLineup: z.array(z.string().trim().max(120)).optional(),
    status: z.enum(EVENT_STATUS).optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine((v) => !(v.startAt && v.endAt) || v.endAt > v.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

export const eventListQuerySchema = paginationQuerySchema.extend({
  type: z.enum(EVENT_TYPE).optional(),
  status: z.enum(EVENT_STATUS).optional(),
  isPublished: z.enum(['true', 'false']).optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
});
export type EventListQuery = z.infer<typeof eventListQuerySchema>;

/** Clone a recurring event into a new dated instance (template → instance). */
export const eventCloneSchema = z
  .object({
    startAt: dateSchema,
    endAt: dateSchema,
    title: z.string().trim().min(2).max(140).optional(),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });
export type EventCloneInput = z.infer<typeof eventCloneSchema>;

export const eventScheduleCreateSchema = z
  .object({
    startAt: dateSchema,
    endAt: dateSchema,
    performer: z.string().trim().max(160).default(''),
    note: z.string().trim().max(400).default(''),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });
export type EventScheduleCreateInput = z.infer<typeof eventScheduleCreateSchema>;
