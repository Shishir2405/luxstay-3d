import 'server-only';
import type { FilterQuery, Model, SortOrder } from 'mongoose';
import { buildPaginationMeta } from '@/server/http/respond';
import type { Paginated } from '@/lib/types';

export interface PaginateOptions<T> {
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  /** Extra filter merged with the soft-delete guard. */
  filter?: FilterQuery<T>;
  /** Fields a `search` term is matched against (case-insensitive regex OR). */
  search?: string;
  searchFields?: string[];
  /** Default sort applied when `sortBy` is absent. */
  defaultSort?: Record<string, SortOrder>;
  /** Populate paths. */
  populate?: string | string[];
  /** Return plain objects (default true). */
  lean?: boolean;
}

/**
 * Reusable server-side pagination for any model. Automatically excludes
 * soft-deleted docs and returns the canonical `{ items, meta }` shape.
 */
export async function paginate<T>(
  model: Model<T>,
  options: PaginateOptions<T>,
): Promise<Paginated<T>> {
  const { page, limit, sortBy, sortDir = 'desc', search, searchFields = [] } = options;

  const filter: FilterQuery<T> = { isDeleted: false, ...(options.filter ?? {}) } as FilterQuery<T>;

  if (search && searchFields.length > 0) {
    const rx = new RegExp(escapeRegex(search), 'i');
    (filter as Record<string, unknown>).$or = searchFields.map((f) => ({ [f]: rx }));
  }

  const sort: Record<string, SortOrder> = sortBy
    ? { [sortBy]: sortDir === 'asc' ? 1 : -1 }
    : (options.defaultSort ?? { createdAt: -1 });

  let q = model
    .find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  if (options.populate) q = q.populate(options.populate) as typeof q;

  const useLean = options.lean !== false;
  const execQuery = useLean ? q.lean() : q;
  const [raw, total] = await Promise.all([execQuery.exec(), model.countDocuments(filter)]);

  // `.lean()` bypasses the schema's toJSON transform, so normalize `_id` → `id`
  // to match the rest of the API (single-doc endpoints return `id`).
  const items = useLean ? (raw as unknown[]).map((d) => normalizeId(d)) : raw;

  return { items: items as T[], meta: buildPaginationMeta(page, limit, total) };
}

/** Shallowly converts a lean Mongo doc's `_id` to a string `id` (also one level into arrays). */
function normalizeId(doc: unknown): unknown {
  if (Array.isArray(doc)) return doc.map(normalizeId);
  if (!doc || typeof doc !== 'object') return doc;
  const obj = doc as Record<string, unknown>;
  if (!('_id' in obj)) return obj;
  const { _id, ...rest } = obj;
  const out: Record<string, unknown> = { id: String(_id), ...rest };
  // Normalize commonly-populated array fields (e.g. amenities) one level deep.
  for (const [key, value] of Object.entries(out)) {
    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] &&
      typeof value[0] === 'object' &&
      '_id' in (value[0] as object)
    ) {
      out[key] = value.map(normalizeId);
    }
  }
  return out;
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
