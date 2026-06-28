import 'server-only';
import { auditRepository, type AuditEntry } from './audit.repository';
import type { AuditDraft, AuthUser } from '@/server/http/context';
import { computeDiff } from '@/server/utils/diff';
import { logger } from '@/server/utils/logger';

export interface RequestMeta {
  ip: string;
  userAgent: string;
  method: string;
  path: string;
}

/**
 * Persists audit drafts collected during a request. Best-effort: an audit
 * failure must never break the user-facing mutation, so errors are logged and
 * swallowed.
 */
export async function flushAuditDrafts(
  drafts: AuditDraft[],
  actor: AuthUser | null,
  meta: RequestMeta,
  defaults: { module: string; action: string },
): Promise<void> {
  if (drafts.length === 0) return;

  const entries: AuditEntry[] = drafts.map((d) => {
    const before = (d.before ?? null) as Record<string, unknown> | null;
    const after = (d.after ?? null) as Record<string, unknown> | null;
    return {
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? 'system',
      actorEmail: actor?.email ?? '',
      module: d.module ?? defaults.module,
      action: d.action ?? defaults.action,
      targetId: d.targetId ?? null,
      targetLabel: d.targetLabel ?? '',
      summary: d.summary ?? '',
      before,
      after,
      diff: before || after ? computeDiff(before, after) : null,
      ip: meta.ip,
      userAgent: meta.userAgent,
      method: meta.method,
      path: meta.path,
    };
  });

  try {
    await auditRepository.insertMany(entries);
  } catch (err) {
    logger.error('audit', 'failed to persist audit drafts', err);
  }
}
