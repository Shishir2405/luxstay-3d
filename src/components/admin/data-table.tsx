'use client';

import type { ReactNode } from 'react';
import { CaretLeft, CaretRight, CircleNotch } from '@phosphor-icons/react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  error?: string | null;
  page?: number;
  totalPages?: number;
  total?: number;
  onPage?: (page: number) => void;
  emptyLabel?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  error,
  page = 1,
  totalPages = 1,
  total = 0,
  onPage,
  emptyLabel = 'Nothing here yet.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-surface-sunken/50 text-left">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                    c.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  <CircleNotch size={22} className="mx-auto animate-spin" />
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-danger">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-sunken/40">
                  {columns.map((c, i) => (
                    <td key={i} className={`px-4 py-3 ${c.align === 'right' ? 'text-right' : ''}`}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {onPage && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              <CaretLeft size={14} /> Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
