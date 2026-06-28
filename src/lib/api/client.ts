import type { Paginated, PaginationMeta, FieldError } from '@/lib/types';

/**
 * Typed fetch wrapper for the LuxStay API.
 *
 * - Talks to same-origin `/api/v1/*` route handlers; cookies (httpOnly access +
 *   refresh) ride along automatically with `credentials: 'include'`.
 * - On a `401` it transparently calls `/auth/refresh` once and retries, so the
 *   15-minute access token rotating in the background is invisible to callers.
 * - Normalizes the server's success/error envelopes (it emits a couple of
 *   slightly different error shapes) into a single thrown `ApiClientError`.
 */

export const API_BASE = '/api/v1';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Field-level errors from a `VALIDATION_ERROR` payload, keyed by field. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    const errors = this.details as FieldError[] | undefined;
    if (Array.isArray(errors)) {
      for (const e of errors) {
        if (e?.field && !out[e.field]) out[e.field] = e.message;
      }
    }
    return out;
  }
}

type Json = Record<string, unknown>;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Plain object → JSON, or a FormData for multipart uploads. */
  body?: unknown;
  /** Query params appended to the path. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Internal: disable the one-shot refresh-retry (used by the refresh call itself). */
  _noRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  if (!query) return url;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

function normalizeError(payload: unknown, status: number): ApiClientError {
  // Canonical error envelope: { success: false, message, code, errors?: FieldError[] }
  const p = payload as { message?: string; code?: string; errors?: FieldError[] } | null;
  if (p?.message) return new ApiClientError(p.message, p.code ?? 'ERROR', status, p.errors);
  return new ApiClientError('Request failed', 'ERROR', status);
}

// De-dupe concurrent refreshes: many 401s in flight share one refresh round-trip.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, _noRetry, headers, ...rest } = options;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const res = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isForm ? {} : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    ...rest,
  });

  // Transparent refresh + retry on expired access token.
  if (res.status === 401 && !_noRetry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(method, path, { ...options, _noRetry: true });
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as Json | null;

  if (!res.ok || !json || json.success === false) {
    throw normalizeError(json, res.status);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

/** GET a list endpoint, returning `{ items, meta }` (server emits items in `data`, page info in `meta`). */
export async function apiList<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const res = await fetch(buildUrl(path, options.query), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json', ...options.headers },
  });
  if (res.status === 401 && !options._noRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return apiList<T>(path, { ...options, _noRetry: true });
  }
  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: T[];
    meta?: PaginationMeta;
  } | null;
  if (!res.ok || !json || json.success === false) throw normalizeError(json, res.status);
  return { items: json.data ?? [], meta: json.meta as PaginationMeta };
}
