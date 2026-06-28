import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { bookingService } from '@/server/modules/bookings/booking.service';
import { objectIdSchema } from '@/lib/validators/common';
import { BOOKING_STATUS } from '@/lib/constants';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const POST = defineRoute<unknown, unknown, Params>({
  permission: ['bookings', 'edit'],
  paramsSchema,
  audit: { module: 'bookings', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await bookingService.transition(
      ctx.params.id,
      BOOKING_STATUS.CHECKED_OUT,
      {
        id: ctx.user!.id,
        name: ctx.user!.name,
      },
    );
    ctx.audit.record({ targetId: ctx.params.id, before, after, summary: 'Checked out' });
    return ok(after, { message: 'Guest checked out' });
  },
});
