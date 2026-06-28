import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { paymentService } from '@/server/modules/payments/payment.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const bodySchema = z.object({ bookingId: objectIdSchema });
type Body = z.infer<typeof bodySchema>;

// Guests (logged in or not) create the server-side order for their held booking.
export const POST = defineRoute<Body>({
  auth: 'optional',
  bodySchema,
  rateLimit: { key: 'rzp-order', limit: 30, windowMs: 10 * 60_000 },
  handler: async (ctx) =>
    ok(await paymentService.createOrder(ctx.body.bookingId), { message: 'Order created' }),
});
