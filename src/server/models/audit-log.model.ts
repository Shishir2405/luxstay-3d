import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface AuditLogAttrs {
  actorId: Types.ObjectId | null;
  actorName: string;
  actorEmail: string;
  module: string;
  action: string;
  targetId: string | null;
  targetLabel: string;
  summary: string;
  before: unknown;
  after: unknown;
  diff: unknown;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
}

/**
 * Immutable record of every admin mutation: actor, module, action, target, and
 * a before/after diff (PRD §4.12 audit trail). Written by `defineRoute` on
 * successful mutations.
 */
const auditLogSchema = createSchema<AuditLogAttrs & BaseFields>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  actorName: { type: String, default: 'system' },
  actorEmail: { type: String, default: '' },

  module: { type: String, required: true, index: true },
  action: { type: String, required: true, index: true },

  targetId: { type: String, default: null, index: true },
  targetLabel: { type: String, default: '' },

  summary: { type: String, default: '' },
  before: { type: Schema.Types.Mixed, default: null },
  after: { type: Schema.Types.Mixed, default: null },
  diff: { type: Schema.Types.Mixed, default: null },

  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  method: { type: String, default: '' },
  path: { type: String, default: '' },
});

auditLogSchema.index({ createdAt: -1 });

export type AuditLogDoc = HydratedDocument<AuditLogAttrs & BaseFields>;

export const AuditLogModel = defineModel<AuditLogAttrs & BaseFields>('AuditLog', auditLogSchema);
