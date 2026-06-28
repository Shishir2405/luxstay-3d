'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export interface ListState {
  page: number;
  limit: number;
  search: string;
  sort?: string;
  order: 'asc' | 'desc';
  filters: Record<string, string>;
}

/**
 * Local state for a server-paginated/filtered list view. Returns the current
 * state plus setters that reset the page when the result set changes.
 */
export function useListState(initial?: Partial<ListState>) {
  const [state, setState] = useState<ListState>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    search: '',
    order: 'desc',
    filters: {},
    ...initial,
  });

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);
  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, search, page: 1 })),
    [],
  );
  const setFilter = useCallback(
    (key: string, value: string) =>
      setState((s) => {
        const filters = { ...s.filters };
        if (value) filters[key] = value;
        else delete filters[key];
        return { ...s, filters, page: 1 };
      }),
    [],
  );
  const setSort = useCallback(
    (sort: string) =>
      setState((s) => ({
        ...s,
        sort,
        order: s.sort === sort && s.order === 'asc' ? 'desc' : 'asc',
        page: 1,
      })),
    [],
  );
  const reset = useCallback(
    () => setState((s) => ({ ...s, page: 1, search: '', filters: {} })),
    [],
  );

  /** Flattened query object ready for `apiList(path, { query })`. */
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      ...(state.search ? { search: state.search } : {}),
      ...(state.sort ? { sort: state.sort, order: state.order } : {}),
      ...state.filters,
    }),
    [state],
  );

  return { state, query, setPage, setSearch, setFilter, setSort, reset, setState };
}
