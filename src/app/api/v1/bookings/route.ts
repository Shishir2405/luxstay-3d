import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok, okPaginated } from '@/server/http/respond';
import { bookingService } from '@/server/modules/bookings/booking.service';
import { createBookingSchema, bookingListQuerySchema } from '@/lib/validators/bookings';

export const runtime = 'nodejs';

type ListQuery = z.infer<typeof bookingListQuerySchema>;
type CreateBody = z.infer<typeof createBookingSchema>;

export const GET = defineRoute<unknown, ListQuery>({
  permission: ['bookings', 'view'],
  querySchema: bookingListQuerySchema,
  handler: async (ctx) =>
    okPaginated(
      await bookingService.list({
        page: ctx.query.page,
        limit: ctx.query.limit,
        search: ctx.query.search,
        sortBy: ctx.query.sortBy,
        sortDir: ctx.query.sortDir,
        status: ctx.query.status,
        dateFrom: ctx.query.dateFrom,
        dateTo: ctx.query.dateTo,
      }),
    ),
});

// Public: guests (logged in or not) create reservations; payment confirms them.
export const POST = defineRoute<CreateBody>({
  auth: 'optional',
  bodySchema: createBookingSchema,
  rateLimit: { key: 'booking-create', limit: 20, windowMs: 10 * 60_000 },
  audit: { module: 'bookings', action: 'create' },
  handler: async (ctx) => {
    const actor = { id: ctx.user?.id ?? null, name: ctx.user?.name ?? ctx.body.contact.name };
    const booking = await bookingService.create(
      ctx.body,
      actor,
      ctx.user?.role === 'Guest' || !ctx.user ? 'web' : 'admin',
    );
    ctx.audit.record({
      targetId: booking.id,
      targetLabel: booking.bookingRef,
      after: booking.toJSON(),
    });
    return ok(booking, { message: 'Reservation held — complete payment to confirm', status: 201 });
  },
});
