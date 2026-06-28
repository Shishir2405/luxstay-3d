import 'server-only';

/**
 * Lightweight fixed-window rate limiter (in-memory, per-process).
 *
 * Good enough for login throttling on a single instance. For multi-instance
 * deployments swap the backing store for Redis (the BullMQ/Redis module already
 * provides a client) — the interface stays the same.
 */
type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as { _rateBuckets?: Map<string, Bucket> };
const buckets = globalForLimiter._rateBuckets ?? new Map<string, Bucket>();
globalForLimiter._rateBuckets = buckets;

export interface RateLimitOptions {
  /** Unique key prefix, e.g. 'login'. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRateLimit(identifier: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucketKey = `${opts.key}:${identifier}`;
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, retryAfterSec: 0 };
  }

  existing.count += 1;
  const allowed = existing.count <= opts.limit;
  return {
    allowed,
    remaining: Math.max(0, opts.limit - existing.count),
    retryAfterSec: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}
