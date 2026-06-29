import type { FilterQuery } from 'mongoose';
import { defineRoute } from '@/server/http/define-route';
import { okPaginated, buildPaginationMeta } from '@/server/http/respond';
import { auditRepository } from '@/server/modules/audit/audit.repository';
import { toCsv, csvResponse, type CsvColumn } from '@/server/utils/csv';
import { auditLogListQuerySchema, type AuditLogListQuery } from '@/lib/validators/settings';

export const runtime = 'nodejs';

type AuditRow = Record<string, unknown>;

/** Builds a Mongo filter from the query, excluding soft-deleted entries. */
function buildFilter(query: AuditLogListQuery): FilterQuery<unknown> {
  const filter: FilterQuery<unknown> = { isDeleted: false };
  if (query.module) filter.module = query.module;
  if (query.action) filter.action = query.action;
  if (query.actorId) filter.actorId = query.actorId;

  if (query.dateFrom || query.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (query.dateFrom) createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) createdAt.$lte = new Date(query.dateTo);
    filter.createdAt = createdAt;
  }
  return filter;
}

const CSV_COLUMNS: CsvColumn<AuditRow>[] = [
  {
    header: 'Date',
    value: (r) => (r.createdAt ? new Date(r.createdAt as string).toISOString() : ''),
  },
  { header: 'Actor', value: (r) => String(r.actorName ?? '') },
  { header: 'Email', value: (r) => String(r.actorEmail ?? '') },
  { header: 'Module', value: (r) => String(r.module ?? '') },
  { header: 'Action', value: (r) => String(r.action ?? '') },
  { header: 'Target', value: (r) => String(r.targetLabel ?? r.targetId ?? '') },
  { header: 'Summary', value: (r) => String(r.summary ?? '') },
  { header: 'IP', value: (r) => String(r.ip ?? '') },
];

export const GET = defineRoute<unknown, AuditLogListQuery>({
  permission: ['auditLogs', 'view'],
  querySchema: auditLogListQuerySchema,
  audit: { module: 'auditLogs', action: 'view' },
  handler: async (ctx) => {
    const { page, limit } = ctx.query;
    const filter = buildFilter(ctx.query);
    const { items, total } = await auditRepository.paginate(filter, page, limit);

    const rows = (items as AuditRow[]).map((doc) => {
      const { _id, ...rest } = doc;
      return { id: String(_id), ...rest };
    });

    if (ctx.query.format === 'csv') {
      ctx.audit.record({ summary: `Exported ${rows.length} audit log entries` });
      return csvResponse(toCsv(rows, CSV_COLUMNS), 'audit-logs.csv');
    }

    return okPaginated({ items: rows, meta: buildPaginationMeta(page, limit, total) });
  },
});
