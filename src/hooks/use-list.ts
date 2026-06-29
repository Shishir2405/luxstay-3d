'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiList, ApiClientError } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types';

export type ListQuery = Record<string, string | number | undefined>;

/** Generic paginated/searchable list loader for admin tables. */
export function useList<T>(path: string, initialQuery: ListQuery = {}) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState<ListQuery>({ page: 1, limit: 20, ...initialQuery });

  const reload = useCallback(() => {
    let active = true;
    setLoading(true);
    apiList<T>(path, { query })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setMeta(res.meta);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiClientError ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, query]);

  useEffect(() => reload(), [reload]);

  const setQuery = useCallback((patch: ListQuery) => {
    setQueryState((q) => ({ ...q, ...patch }));
  }, []);

  const setPage = useCallback((page: number) => setQuery({ page }), [setQuery]);
  const setSearch = useCallback((search: string) => setQuery({ search, page: 1 }), [setQuery]);

  return { items, meta, loading, error, query, setQuery, setPage, setSearch, reload };
}
