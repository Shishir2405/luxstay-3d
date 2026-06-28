import { z } from 'zod';
import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { availabilityService } from '@/server/modules/rooms/availability.service';
import { objectIdSchema } from '@/lib/validators/common';
import { blockDatesSchema } from '@/lib/validators/rooms';

export const runtime = 'nodejs';

const calendarQuerySchema = z
  .object({
    roomUnit: objectIdSchema.optional(),
    roomType: objectIdSchema.optional(),
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date(),
  })
  .refine((v) => v.roomUnit || v.roomType, {
    message: 'Provide roomUnit or roomType',
    path: ['roomType'],
  });

type CalendarQuery = z.infer<typeof calendarQuerySchema>;
type BlockBody = z.infer<typeof blockDatesSchema>;

/** Calendar view: per-night occupancy for a unit or type over a window. */
export const GET = defineRoute<unknown, CalendarQuery>({
  permission: ['rooms', 'view'],
  querySchema: calendarQuerySchema,
  handler: async (ctx) => ok(await availabilityService.calendar(ctx.query)),
});

/** Admin: block a unit or whole room type for a date range (night-lock ledger). */
export const POST = defineRoute<BlockBody>({
  permission: ['rooms', 'edit'],
  bodySchema: blockDatesSchema,
  audit: { module: 'rooms', action: 'update' },
  handler: async (ctx) => {
    const result = await availabilityService.blockDates({ ...ctx.body, actorId: ctx.user!.id });
    const from = ctx.body.dateFrom.toISOString().slice(0, 10);
    const to = ctx.body.dateTo.toISOString().slice(0, 10);
    ctx.audit.record({
      targetId: result.blockRef,
      summary: `Blocked ${result.blocked} night-slots ${from} → ${to} (${ctx.body.reason})${
        result.conflicts ? `, ${result.conflicts} already booked` : ''
      }`,
      after: result,
    });
    return ok(result, { message: 'Dates blocked', status: 201 });
  },
});
