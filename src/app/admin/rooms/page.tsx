'use client';

import { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { useList } from '@/hooks/use-list';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/lib/format';

interface RoomTypeRow {
  id: string;
  name: string;
  basePrice: number;
  currency: string;
  maxAdults: number;
  bedType: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminRoomsPage() {
  const { items, meta, loading, error, setPage, setSearch } = useList<RoomTypeRow>('/room-types');
  const [q, setQ] = useState('');

  const columns: Column<RoomTypeRow>[] = [
    { header: 'Room type', cell: (r) => <span className="font-medium">{r.name}</span> },
    { header: 'Bed', cell: (r) => <span className="text-muted-foreground">{r.bedType}</span> },
    { header: 'Max adults', cell: (r) => r.maxAdults },
    { header: 'Price / night', align: 'right', cell: (r) => formatMoney(r.basePrice, r.currency) },
    {
      header: 'Status',
      cell: (r) => (
        <div className="flex gap-1.5">
          <Badge tone={r.isActive ? 'success' : 'neutral'} dot>
            {r.isActive ? 'Active' : 'Hidden'}
          </Badge>
          {r.isFeatured && <Badge tone="accent">Featured</Badge>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Rooms & Types" description="Your room inventory and pricing." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
        }}
        className="relative mb-4 max-w-xs"
      >
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search rooms…"
          className="w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
        />
      </form>
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        page={meta?.page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPage={setPage}
        emptyLabel="No room types yet."
      />
    </div>
  );
}
