'use client';

import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { ListSearch } from '@/components/admin/list-search';
import { useList } from '@/hooks/use-list';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/format';

interface EventRow {
  id: string;
  title: string;
  startAt: string;
  capacity: number;
  rsvpCount: number;
  status: string;
  isPublished: boolean;
}

export default function AdminEventsPage() {
  const { items, meta, loading, error, setPage, setSearch } = useList<EventRow>('/events');
  const columns: Column<EventRow>[] = [
    { header: 'Event', cell: (r) => <span className="font-medium">{r.title}</span> },
    {
      header: 'Starts',
      cell: (r) => (
        <span className="text-muted-foreground">{r.startAt ? formatDate(r.startAt) : '—'}</span>
      ),
    },
    {
      header: 'Capacity',
      cell: (r) => (
        <span className="text-muted-foreground">
          {r.rsvpCount ?? 0} / {r.capacity ?? 0}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <Badge tone={r.isPublished ? 'success' : 'neutral'} dot>
          {r.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
  ];
  return (
    <div>
      <PageHeader title="Events" description="Parties, live music and special nights." />
      <ListSearch onSearch={setSearch} placeholder="Search events…" />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        page={meta?.page}
        totalPages={meta?.totalPages}
        total={meta?.total}
        onPage={setPage}
        emptyLabel="No events yet."
      />
    </div>
  );
}
