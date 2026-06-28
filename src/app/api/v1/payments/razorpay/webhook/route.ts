import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { paymentService } from '@/server/modules/payments/payment.service';

export const runtime = 'nodejs';

/**
 * Razorpay webhook — the SERVER-SIDE source of truth for payment status.
 * The signature is verified against the RAW body before any booking is marked
 * paid; a client-side "success" callback is never trusted on its own.
 * No bodySchema so the raw body stays intact for HMAC verification.
 */
export const POST = defineRoute({
  auth: false,
  audit: { module: 'payments', action: 'create' },
  handler: async (ctx) => {
    const rawBody = await ctx.req.text();
    const signature = ctx.req.headers.get('x-razorpay-signature') ?? '';
    const result = await paymentService.handleWebhook(rawBody, signature);
    if (result.handled && result.event) {
      ctx.audit.record({ summary: `Razorpay webhook: ${result.event}` });
    }
    return ok(result, { message: 'Webhook processed' });
  },
});
