import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { pricingService } from '@/server/modules/rooms/pricing.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
const querySchema = z.object({ dateFrom: z.coerce.date(), dateTo: z.coerce.date() });
type Params = z.infer<typeof paramsSchema>;
type Query = z.infer<typeof querySchema>;

/** Public stay quote — drives the booking widget's live price breakdown. */
export const GET = defineRoute<unknown, Query, Params>({
  auth: false,
  paramsSchema,
  querySchema,
  handler: async (ctx) =>
    ok(await pricingService.quoteStay(ctx.params.id, ctx.query.dateFrom, ctx.query.dateTo)),
});
