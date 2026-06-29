'use client';

import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { ListSearch } from '@/components/admin/list-search';
import { useList } from '@/hooks/use-list';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/lib/format';

interface MenuRow {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  spiceLevel?: number;
  dietaryTags?: string[];
}

export default function AdminMenuPage() {
  const { items, meta, loading, error, setPage, setSearch } = useList<MenuRow>('/menu-items');
  const columns: Column<MenuRow>[] = [
    { header: 'Item', cell: (r) => <span className="font-medium">{r.name}</span> },
    {
      header: 'Tags',
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {(r.dietaryTags ?? []).join(', ') || '—'}
        </span>
      ),
    },
    { header: 'Price', align: 'right', cell: (r) => formatMoney(r.price ?? 0, 'INR') },
    {
      header: 'Status',
      cell: (r) => (
        <Badge tone={r.isAvailable ? 'success' : 'warning'} dot>
          {r.isAvailable ? 'Available' : 'Sold out'}
        </Badge>
      ),
    },
  ];
  return (
    <div>
      <PageHeader title="Menu & Lounge" description="Food, drinks and bar offerings." />
      <ListSearch onSearch={setSearch} placeholder="Search menu…" />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        page={meta?.page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPage={setPage}
        emptyLabel="No menu items yet."
      />
    </div>
  );
}
