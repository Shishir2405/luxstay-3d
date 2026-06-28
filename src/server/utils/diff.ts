import 'server-only';

/** Field-level before/after diff for audit logs. */
export type FieldDiff = Record<string, { from: unknown; to: unknown }>;

const IGNORED = new Set(['updatedAt', 'createdAt', '__v', 'updatedBy', 'createdBy']);

function normalize(value: unknown): unknown {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (
    value &&
    typeof value === 'object' &&
    'toString' in value &&
    value.constructor?.name === 'ObjectId'
  ) {
    return value.toString();
  }
  return value;
}

/** Computes the changed fields between two plain objects (shallow, JSON-compared). */
export function computeDiff(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): FieldDiff {
  const diff: FieldDiff = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);

  for (const key of keys) {
    if (IGNORED.has(key)) continue;
    const from = normalize(before?.[key]);
    const to = normalize(after?.[key]);
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      diff[key] = { from, to };
    }
  }
  return diff;
}
