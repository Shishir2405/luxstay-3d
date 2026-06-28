import 'server-only';
import { AuditLogModel } from '@/server/models/audit-log.model';
import type { FilterQuery } from 'mongoose';

export interface AuditEntry {
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  module: string;
  action: string;
  targetId?: string | null;
  targetLabel?: string;
  summary?: string;
  before?: unknown;
  after?: unknown;
  diff?: unknown;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
}

export const auditRepository = {
  insertMany(entries: AuditEntry[]) {
    return AuditLogModel.insertMany(entries, { ordered: false });
  },

  async paginate(filter: FilterQuery<unknown>, page: number, limit: number) {
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLogModel.countDocuments(filter),
    ]);
    return { items, total };
  },
};
