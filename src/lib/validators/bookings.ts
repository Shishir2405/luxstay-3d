import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common';
import { BOOKING_STATUS, PAYMENT_TYPE } from '@/lib/constants/enums';

const dateSchema = z.coerce.date();

export const guestContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(20),
});

export const roomSelectionSchema = z
  .object({
    roomType: objectIdSchema,
    dateFrom: dateSchema,
    dateTo: dateSchema,
    adults: z.number().int().min(1).max(20).default(2),
    children: z.number().int().min(0).max(20).default(0),
  })
  .refine((v) => v.dateTo > v.dateFrom, {
    message: 'Check-out must be after check-in',
    path: ['dateTo'],
  });

export const createBookingSchema = z.object({
  contact: guestContactSchema,
  // Group booking: more than one room in a single transaction.
  rooms: z.array(roomSelectionSchema).min(1).max(8),
  promoCode: z.string().trim().toUpperCase().max(24).optional().or(z.literal('')),
  paymentType: z.nativeEnum(PAYMENT_TYPE).default(PAYMENT_TYPE.FULL),
  specialRequests: z.string().max(1000).optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const bookingListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(BOOKING_STATUS).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
});

export const waitlistJoinSchema = z.object({
  contact: guestContactSchema,
  roomType: objectIdSchema,
  dateFrom: dateSchema,
  dateTo: dateSchema,
});
