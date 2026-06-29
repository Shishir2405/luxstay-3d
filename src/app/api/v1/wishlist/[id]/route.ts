import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { wishlistService } from '@/server/modules/customer/wishlist.service';
import { objectIdSchema } from '@/lib/validators/common';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const DELETE = defineRoute<unknown, unknown, Params>({
  auth: true,
  paramsSchema,
  handler: async (ctx) => {
    await wishlistService.remove(ctx.user!.id, ctx.params.id);
    return ok(null, { message: 'Removed from wishlist' });
  },
});
