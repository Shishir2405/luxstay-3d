import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { analyticsService } from '@/server/modules/analytics/analytics.service';
import { bookingReportQuerySchema, type BookingReportQuery } from '@/lib/validators/analytics';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, BookingReportQuery>({
  permission: ['reports', 'view'],
  querySchema: bookingReportQuerySchema,
  handler: async (ctx) => ok(await analyticsService.bookingReport(ctx.query)),
});
