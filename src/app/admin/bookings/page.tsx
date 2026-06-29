'use client';

import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { ListSearch } from '@/components/admin/list-search';
import { useList } from '@/hooks/use-list';
import { Badge, type BadgeTone } from '@/components/ui';
import { formatMoney, formatDate } from '@/lib/format';

interface BookingRow {
  id: string;
  bookingRef: string;
  contact: { name: string };
  rooms: unknown[];
  status: string;
  pricing: { total: number; currency: string };
  createdAt: string;
}

const TONE: Record<string, BadgeTone> = {
  Confirmed: 'success',
  CheckedOut: 'success',
  Completed: 'success',
  Pending: 'warning',
  CheckedIn: 'info',
  Cancelled: 'danger',
  NoShow: 'danger',
};

export default function AdminBookingsPage() {
  const { items, meta, loading, error, setPage, setSearch } = useList<BookingRow>('/bookings');
  const columns: Column<BookingRow>[] = [
    { header: 'Ref', cell: (r) => <span className="font-mono text-xs">{r.bookingRef}</span> },
    { header: 'Guest', cell: (r) => <span className="font-medium">{r.contact?.name}</span> },
    { header: 'Rooms', cell: (r) => r.rooms?.length ?? 0 },
    {
      header: 'Status',
      cell: (r) => (
        <Badge tone={TONE[r.status] ?? 'neutral'} dot>
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Total',
      align: 'right',
      cell: (r) => formatMoney(r.pricing?.total ?? 0, r.pricing?.currency),
    },
    {
      header: 'Booked',
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
  ];
  return (
    <div>
      <PageHeader title="Bookings" description="Every reservation across the property." />
      <ListSearch onSearch={setSearch} placeholder="Search ref or guest…" />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        page={meta?.page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPage={setPage}
        emptyLabel="No bookings yet."
      />
    </div>
  );
}
