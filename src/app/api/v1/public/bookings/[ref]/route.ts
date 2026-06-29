import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { bookingService } from '@/server/modules/bookings/booking.service';

export const runtime = 'nodejs';

// The booking ref is an unguessable code, so it acts as a capability token for
// the guest to view their own confirmation without an account.
const paramsSchema = z.object({ ref: z.string().min(4).max(20) });
type Params = z.infer<typeof paramsSchema>;

export const GET = defineRoute<unknown, unknown, Params>({
  auth: false,
  paramsSchema,
  handler: async (ctx) => {
    const booking = await bookingService.getByRef(ctx.params.ref.toUpperCase());
    return ok(booking);
  },
});
