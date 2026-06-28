import { z } from 'zod';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';

/** MongoDB ObjectId (24-hex) string. */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

/** Standard list query: ?page=&limit=&search=&sortBy=&sortDir= */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).catch(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().trim().max(60).optional(),
  sortDir: z.enum(['asc', 'desc']).catch('desc'),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** ISO date string (yyyy-mm-dd or full ISO). */
export const isoDateSchema = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

export const dateRangeSchema = z
  .object({ dateFrom: isoDateSchema, dateTo: isoDateSchema })
  .refine((v) => new Date(v.dateFrom) <= new Date(v.dateTo), {
    message: 'dateFrom must be on or before dateTo',
    path: ['dateTo'],
  });

/** Money field stored in major units, validated to 2 decimal places. */
export const moneySchema = z
  .number()
  .nonnegative()
  .refine((v) => Number.isFinite(v) && Math.round(v * 100) === v * 100, {
    message: 'Amount must have at most 2 decimal places',
  });
