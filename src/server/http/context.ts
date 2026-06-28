import 'server-only';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/types';

export type { AuthUser };

/** A single audit entry the handler wishes to record (before/after diff). */
export interface AuditDraft {
  module?: string;
  action?: string;
  targetId?: string;
  targetLabel?: string;
  before?: unknown;
  after?: unknown;
  summary?: string;
  metadata?: Record<string, unknown>;
}

/** Collects audit drafts during a request; flushed by `defineRoute` on success. */
export class AuditRecorder {
  private drafts: AuditDraft[] = [];
  record(draft: AuditDraft) {
    this.drafts.push(draft);
  }
  drain(): AuditDraft[] {
    const out = this.drafts;
    this.drafts = [];
    return out;
  }
}

export interface RouteCtx<TBody = unknown, TQuery = unknown, TParams = unknown> {
  req: NextRequest;
  user: AuthUser | null;
  body: TBody;
  query: TQuery;
  params: TParams;
  ip: string;
  userAgent: string;
  audit: AuditRecorder;
}
