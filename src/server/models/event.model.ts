import 'server-only';
import { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

const EVENT_STATUS = ['draft', 'scheduled', 'live', 'completed', 'cancelled'] as const;
const EVENT_TYPE = ['party', 'concert', 'dj-night', 'private', 'corporate', 'special'] as const;

export interface EventMedia {
  url: string;
  alt: string;
  sortOrder: number;
}

export interface EventTier {
  name: string;
  price: number;
  perks: string[];
  capacity: number;
}

export interface EventAttrs {
  title: string;
  slug: string;
  description: string;
  type: (typeof EVENT_TYPE)[number];
  bannerUrl: string;
  media: EventMedia[];
  startAt: Date;
  endAt: Date;
  venue: string;
  capacity: number;
  rsvpCount: number;
  tiers: EventTier[];
  isRecurring: boolean;
  recurrenceRule: string;
  djLineup: string[];
  status: (typeof EVENT_STATUS)[number];
  isPublished: boolean;
  isFeatured: boolean;
}

const mediaSchema = new Schema<EventMedia>(
  {
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const tierSchema = new Schema<EventTier>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
    perks: { type: [String], default: [] },
    capacity: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const eventSchema = createSchema<EventAttrs & BaseFields>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  type: { type: String, enum: EVENT_TYPE, default: 'party', index: true },
  bannerUrl: { type: String, default: '' },
  media: { type: [mediaSchema], default: [] },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true },
  venue: { type: String, default: '' },
  capacity: { type: Number, default: 0, min: 0 },
  rsvpCount: { type: Number, default: 0, min: 0 },
  tiers: { type: [tierSchema], default: [] },
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: { type: String, default: '' },
  djLineup: { type: [String], default: [] },
  status: { type: String, enum: EVENT_STATUS, default: 'draft', index: true },
  isPublished: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false },
});

export type EventDoc = HydratedDocument<EventAttrs & BaseFields>;
export const EventModel = defineModel<EventAttrs & BaseFields>('Event', eventSchema);
