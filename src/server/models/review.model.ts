import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { REVIEW_STATUS, type ReviewStatus } from '@/lib/constants';

export interface ReviewAttrs {
  /** Authenticated guest who wrote the review, or null for anonymous/seeded entries. */
  user: Types.ObjectId | null;
  authorName: string;
  roomType: Types.ObjectId | null;
  booking: Types.ObjectId | null;
  rating: number; // 1-5
  title: string;
  body: string;
  status: ReviewStatus;
  /** Whether the review is shown on public listings (admin-controlled). */
  isPublic: boolean;
}

const reviewSchema = createSchema<ReviewAttrs & BaseFields>({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  authorName: { type: String, required: true, trim: true },
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', default: null, index: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '', trim: true },
  body: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: Object.values(REVIEW_STATUS),
    default: REVIEW_STATUS.PENDING,
    index: true,
  },
  isPublic: { type: Boolean, default: false, index: true },
});

export type ReviewDoc = HydratedDocument<ReviewAttrs & BaseFields>;
export const ReviewModel = defineModel<ReviewAttrs & BaseFields>('Review', reviewSchema);
