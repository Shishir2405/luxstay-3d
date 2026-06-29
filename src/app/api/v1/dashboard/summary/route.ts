import { defineRoute } from '@/server/http/define-route';
import { ok } from '@/server/http/respond';
import { analyticsService } from '@/server/modules/analytics/analytics.service';

export const runtime = 'nodejs';

export const GET = defineRoute({
  permission: ['analytics', 'view'],
  handler: async () => ok(await analyticsService.dashboardSummary()),
});
