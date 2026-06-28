'use client';

import {
  Plus,
  CalendarPlus,
  Bed,
  CalendarCheck,
  Champagne,
  CurrencyInr,
  ArrowRight,
  Warning,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/auth';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Button, Badge } from '@/components/ui';

/**
 * Operations overview. Stat values are placeholders until the analytics module
 * lands a `/admin/dashboard/summary` endpoint; the layout + role-scoping are real.
 */
const STATS = [
  {
    label: 'Occupancy today',
    value: '82%',
    icon: Bed,
    delta: 4.2,
    tone: 'accent' as const,
    hint: '46 of 56 rooms sold',
  },
  {
    label: "Today's check-ins",
    value: '18',
    icon: CalendarCheck,
    delta: 12,
    tone: 'info' as const,
    hint: '7 still to arrive',
  },
  {
    label: 'RSVPs tonight',
    value: '124',
    icon: Champagne,
    delta: -3.1,
    tone: 'warning' as const,
    hint: 'Rooftop Sessions',
  },
  {
    label: "Today's revenue",
    value: '₹4.82L',
    icon: CurrencyInr,
    delta: 8.6,
    tone: 'success' as const,
    hint: 'Rooms + bar + events',
  },
];

const ARRIVALS = [
  { name: 'Avani & Rohan Mehta', room: 'Deluxe Suite · 412', time: '14:00', status: 'Confirmed' },
  { name: 'Daniel Okonkwo', room: 'Executive King · 305', time: '15:30', status: 'Confirmed' },
  { name: 'Mei Lin Tan', room: 'Garden Villa · 02', time: '16:00', status: 'Pending' },
  { name: 'The Kapoor Group (4)', room: '4 rooms · Floor 6', time: '18:00', status: 'Confirmed' },
];

const ALERTS = [
  { text: '2 payments pending webhook confirmation', tone: 'warning' as const },
  { text: 'Sea-view suites below 10% availability this weekend', tone: 'danger' as const },
  { text: 'Room 208 flagged for maintenance — auto-blocked', tone: 'info' as const },
];

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${firstName}`}
        description="Here's how the property is performing today."
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon={<CalendarPlus size={16} />}>
              New event
            </Button>
            <Button size="sm" leftIcon={<Plus size={16} weight="bold" />}>
              Add room
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Arrivals */}
        <section className="rounded-xl border border-border/70 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold">Today&apos;s arrivals</h2>
              <p className="text-sm text-muted-foreground">Front-desk check-in queue</p>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={15} />}>
              All bookings
            </Button>
          </div>
          <ul className="divide-y divide-border/60">
            {ARRIVALS.map((a) => (
              <li key={a.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.room}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-muted-foreground">{a.time}</span>
                  <Badge tone={a.status === 'Confirmed' ? 'success' : 'warning'} dot>
                    {a.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Alerts */}
        <section className="rounded-xl border border-border/70 bg-card">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
            <Warning size={18} weight="duotone" className="text-warning" />
            <h2 className="font-display text-base font-semibold">Needs attention</h2>
          </div>
          <ul className="flex flex-col gap-3 p-5">
            {ALERTS.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={cnTone(a.tone)} aria-hidden />
                <p className="text-sm text-foreground/90">{a.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function cnTone(tone: 'warning' | 'danger' | 'info'): string {
  const color = tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning' : 'bg-info';
  return `mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`;
}
