import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { promoService } from '@/server/modules/rooms/promo.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const applySchema = z.object({
  code: z.string().trim().min(1),
  roomTypeId: objectIdSchema,
  nights: z.number().int().min(1),
  amount: z.number().min(0),
});
type ApplyBody = z.infer<typeof applySchema>;

/** Public: validate a promo code against a cart and return the discount preview. */
export const POST = defineRoute<ApplyBody>({
  auth: 'optional',
  bodySchema: applySchema,
  rateLimit: { key: 'promo-apply', limit: 30, windowMs: 5 * 60_000 },
  handler: async (ctx) => ok(await promoService.apply(ctx.body), { message: 'Promo applied' }),
});
