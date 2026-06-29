import { z } from 'zod';
import { BOOKING_STATUS } from '@/lib/constants/enums';

/** ISO string in / `Date` out — route handlers receive a real Date. */
const dateSchema = z.coerce.date();

/** Trend bucketing granularity. */
export const TREND_PERIOD = ['daily', 'weekly', 'monthly'] as const;

/** ?period=&from=&to= for revenue/RevPAR trend charts. */
export const revenueTrendQuerySchema = z
  .object({
    period: z.enum(TREND_PERIOD).catch('daily'),
    from: dateSchema.optional(),
    to: dateSchema.optional(),
  })
  .refine((v) => !(v.from && v.to) || v.from <= v.to, {
    message: 'from must be on or before to',
    path: ['to'],
  });
export type RevenueTrendQuery = z.infer<typeof revenueTrendQuerySchema>;

/** Booking report / export filters. */
export const bookingReportQuerySchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    status: z.nativeEnum(BOOKING_STATUS).optional(),
    source: z.enum(['web', 'admin']).optional(),
  })
  .refine((v) => !(v.from && v.to) || v.from <= v.to, {
    message: 'from must be on or before to',
    path: ['to'],
  });
export type BookingReportQuery = z.infer<typeof bookingReportQuerySchema>;
