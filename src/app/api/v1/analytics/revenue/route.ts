import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { analyticsService } from '@/server/modules/analytics/analytics.service';
import { revenueTrendQuerySchema, type RevenueTrendQuery } from '@/lib/validators/analytics';

export const runtime = 'nodejs';

export const GET = defineRoute<unknown, RevenueTrendQuery>({
  permission: ['analytics', 'view'],
  querySchema: revenueTrendQuerySchema,
  handler: async (ctx) => ok(await analyticsService.revenueTrend(ctx.query)),
});
