'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Confetti } from '@phosphor-icons/react';
import { getPublicBooking, type BookingResult } from '@/lib/api/bookings';
import { formatMoney, formatDate } from '@/lib/format';

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={<div className="container py-24 text-center text-muted-foreground">Loading…</div>}
    >
      <ConfirmationInner />
    </Suspense>
  );
}

function ConfirmationInner() {
  const params = useParams<{ ref: string }>();
  const search = useSearchParams();
  const paid = search?.get('paid') === '1';

  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!params?.ref) return;
    let tries = 0;
    // After payment the webhook confirms async — poll briefly for status flip.
    const load = () =>
      getPublicBooking(params.ref)
        .then((b) => {
          setBooking(b);
          setStatus('ready');
          if (paid && b.status === 'Pending' && tries < 4) {
            tries += 1;
            setTimeout(load, 1500);
          }
        })
        .catch(() => setStatus('error'));
    load();
  }, [params?.ref, paid]);

  if (status === 'loading') {
    return (
      <div className="container py-24 text-center text-muted-foreground">
        Loading your reservation…
      </div>
    );
  }
  if (status === 'error' || !booking) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">We couldn&apos;t find that reservation.</p>
        <Link href="/rooms" className="mt-4 inline-block text-accent">
          Browse rooms
        </Link>
      </div>
    );
  }

  const confirmed = booking.status === 'Confirmed' || booking.payment.amountPaid > 0;

  return (
    <div className="container max-w-2xl py-16 md:py-24">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          {confirmed ? <Confetti size={32} weight="fill" /> : <Clock size={32} />}
        </div>
        <h1 className="font-display text-3xl">
          {confirmed ? 'Booking confirmed' : 'Reservation held'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {confirmed
            ? 'A confirmation email is on its way. We can’t wait to host you.'
            : 'Your room is held briefly. Complete payment to confirm your stay.'}
        </p>
        <p className="mt-4 inline-block rounded-full bg-surface-sunken px-4 py-1.5 font-mono text-sm">
          {booking.bookingRef}
        </p>

        <div className="mt-8 space-y-3 text-left">
          {booking.rooms.map((r, i) => (
            <div
              key={i}
              className="flex items-start justify-between rounded-xl bg-surface-sunken p-4"
            >
              <div>
                <p className="font-medium">{r.roomTypeName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(r.dateFrom)} → {formatDate(r.dateTo)} · {r.nights} night
                  {r.nights === 1 ? '' : 's'} · {r.adults} adults
                </p>
              </div>
              <span className="font-medium">
                {formatMoney(r.subtotal, booking.pricing.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
          {booking.pricing.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−{formatMoney(booking.pricing.discount, booking.pricing.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatMoney(booking.pricing.total, booking.pricing.currency)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Status</span>
            <span className="inline-flex items-center gap-1.5">
              {confirmed ? (
                <CheckCircle size={15} weight="fill" className="text-success" />
              ) : (
                <Clock size={15} />
              )}
              {booking.status}
            </span>
          </div>
        </div>

        <Link
          href="/rooms"
          className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Browse more rooms
        </Link>
      </div>
    </div>
  );
}
