import { defineRoute } from '@/server/http/define-route';
import { toCsv, csvResponse, type CsvColumn } from '@/server/utils/csv';
import { analyticsService } from '@/server/modules/analytics/analytics.service';
import { toNightKey } from '@/server/utils/dates';
import { bookingReportQuerySchema, type BookingReportQuery } from '@/lib/validators/analytics';

export const runtime = 'nodejs';

type ReportRow = Awaited<ReturnType<typeof analyticsService.bookingReport>>[number];

const columns: CsvColumn<ReportRow>[] = [
  { header: 'Booking Ref', value: (r) => r.bookingRef },
  { header: 'Guest Name', value: (r) => r.guestName },
  { header: 'Guest Email', value: (r) => r.guestEmail },
  { header: 'Status', value: (r) => r.status },
  { header: 'Source', value: (r) => r.source },
  { header: 'Rooms', value: (r) => r.rooms },
  { header: 'Nights', value: (r) => r.nights },
  { header: 'Currency', value: (r) => r.currency },
  { header: 'Total', value: (r) => r.total },
  { header: 'Amount Paid', value: (r) => r.amountPaid },
  { header: 'Amount Due', value: (r) => r.amountDue },
  { header: 'Created At', value: (r) => r.createdAt.toISOString() },
];

export const GET = defineRoute<unknown, BookingReportQuery>({
  permission: ['reports', 'export'],
  querySchema: bookingReportQuerySchema,
  audit: { module: 'reports', action: 'export' },
  handler: async (ctx) => {
    const rows = await analyticsService.bookingReport(ctx.query);
    ctx.audit.record({ summary: `Exported ${rows.length} bookings to CSV` });
    const csv = toCsv(rows, columns);
    return csvResponse(csv, `bookings-${toNightKey(new Date())}.csv`);
  },
});
