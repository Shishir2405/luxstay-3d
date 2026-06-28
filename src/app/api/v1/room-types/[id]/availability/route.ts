import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { availabilityService } from '@/server/modules/rooms/availability.service';
import { objectIdSchema } from '@/lib/validators/common';
import { availabilityQuerySchema } from '@/lib/validators/rooms';
import { hasPermission } from '@/lib/constants';

export const runtime = 'nodejs';

const paramsSchema = z.object({ id: objectIdSchema });
type Params = z.infer<typeof paramsSchema>;
type Query = z.infer<typeof availabilityQuerySchema>;

// Public: the booking flow checks availability before a guest signs in. Only
// the available count is exposed to the public; unit-level detail is staff-only.
export const GET = defineRoute<unknown, Query, Params>({
  auth: 'optional',
  paramsSchema,
  querySchema: availabilityQuerySchema,
  handler: async (ctx) => {
    const units = await availabilityService.findAvailableUnits(
      ctx.params.id,
      ctx.query.dateFrom,
      ctx.query.dateTo,
    );
    const isStaff = Boolean(ctx.user && hasPermission(ctx.user.permissions, 'rooms', 'view'));
    return ok({
      roomType: ctx.params.id,
      dateFrom: ctx.query.dateFrom,
      dateTo: ctx.query.dateTo,
      available: units.length,
      ...(isStaff
        ? {
            units: units.map((u) => ({
              id: String(u._id),
              unitNumber: u.unitNumber,
              floor: u.floor,
            })),
          }
        : {}),
    });
  },
});
