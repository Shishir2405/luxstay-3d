import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { paymentService } from '@/server/modules/payments/payment.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ bookingId: objectIdSchema });
const bodySchema = z.object({
  amount: z.number().positive(),
  reason: z.string().trim().max(300).default(''),
});
type Params = z.infer<typeof paramsSchema>;
type Body = z.infer<typeof bodySchema>;

export const POST = defineRoute<Body, unknown, Params>({
  permission: ['refunds', 'create'],
  paramsSchema,
  bodySchema,
  audit: { module: 'refunds', action: 'create' },
  handler: async (ctx) => {
    const result = await paymentService.refund(
      ctx.params.bookingId,
      ctx.body.amount,
      ctx.body.reason,
    );
    ctx.audit.record({
      targetId: ctx.params.bookingId,
      summary: `Refund ${ctx.body.amount} (${result.refundId})`,
    });
    return ok(result, { message: 'Refund initiated' });
  },
});
