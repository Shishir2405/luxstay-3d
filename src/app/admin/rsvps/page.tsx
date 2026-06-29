'use client';

import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { ListSearch } from '@/components/admin/list-search';
import { useList } from '@/hooks/use-list';
import { Badge, type BadgeTone } from '@/components/ui';

interface RsvpRow {
  id: string;
  code: string;
  contact: { name: string };
  guestCount: number;
  tier: string;
  status: string;
  eventName?: string;
}

const TONE: Record<string, BadgeTone> = {
  Confirmed: 'success',
  CheckedIn: 'accent',
  Pending: 'warning',
  Waitlisted: 'info',
  Cancelled: 'danger',
  NoShow: 'danger',
};

export default function AdminRsvpsPage() {
  const { items, meta, loading, error, setPage, setSearch } = useList<RsvpRow>('/rsvps');
  const columns: Column<RsvpRow>[] = [
    { header: 'Code', cell: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { header: 'Guest', cell: (r) => <span className="font-medium">{r.contact?.name}</span> },
    {
      header: 'Event',
      cell: (r) => <span className="text-muted-foreground">{r.eventName || '—'}</span>,
    },
    { header: 'Party', cell: (r) => r.guestCount },
    { header: 'Tier', cell: (r) => <Badge tone="outline">{r.tier}</Badge> },
    {
      header: 'Status',
      cell: (r) => (
        <Badge tone={TONE[r.status] ?? 'neutral'} dot>
          {r.status}
        </Badge>
      ),
    },
  ];
  return (
    <div>
      <PageHeader title="RSVPs" description="Guest list across events and tables." />
      <ListSearch onSearch={setSearch} placeholder="Search code or guest…" />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        page={meta?.page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPage={setPage}
        emptyLabel="No RSVPs yet."
      />
    </div>
  );
}
