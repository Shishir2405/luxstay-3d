import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { menuItemService } from '@/server/modules/menu/menu-item.service';
import { objectIdSchema } from '@/lib/validators/common';
import { menuItemAvailabilitySchema, type MenuItemAvailabilityInput } from '@/lib/validators/menu';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;

export const POST = defineRoute<MenuItemAvailabilityInput, unknown, Params>({
  permission: ['menu', 'edit'],
  paramsSchema,
  bodySchema: menuItemAvailabilitySchema,
  audit: { module: 'menu', action: 'update' },
  handler: async (ctx) => {
    const { before, after } = await menuItemService.setAvailability(
      ctx.params.id,
      ctx.body.isAvailable,
      ctx.user!.id,
    );
    ctx.audit.record({
      targetId: ctx.params.id,
      before,
      after,
      summary: ctx.body.isAvailable ? 'Marked available' : 'Marked sold out',
    });
    return ok(after, { message: 'Availability updated' });
  },
});
