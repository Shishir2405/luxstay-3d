import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { bookingService } from '@/server/modules/bookings/booking.service';
import { ApiError } from '@/server/utils/api-error';
import { objectIdSchema } from '@/lib/validators/common';
import { cancelBookingSchema } from '@/lib/validators/bookings';
import { hasPermission } from '@/lib/constants';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type Body = z.infer<typeof cancelBookingSchema>;

export const POST = defineRoute<Body, unknown, Params>({
  auth: true,
  paramsSchema,
  bodySchema: cancelBookingSchema,
  audit: { module: 'bookings', action: 'update' },
  handler: async (ctx) => {
    const booking = await bookingService.getById(ctx.params.id);
    const owns = Boolean(booking.user && ctx.user && String(booking.user) === ctx.user.id);
    const staff = Boolean(ctx.user && hasPermission(ctx.user.permissions, 'bookings', 'edit'));
    if (!owns && !staff) throw ApiError.forbidden('You cannot cancel this booking');

    const { before, after, refundAmount } = await bookingService.cancel(
      ctx.params.id,
      ctx.body.reason,
      {
        id: ctx.user!.id,
        name: ctx.user!.name,
      },
    );
    ctx.audit.record({
      targetId: ctx.params.id,
      targetLabel: booking.bookingRef,
      before,
      after,
      summary: `Cancelled — refund ${refundAmount}`,
    });
    return ok({ booking: after, refundAmount }, { message: 'Booking cancelled' });
  },
});
