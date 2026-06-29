'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarBlank, Users, CheckCircle, SpinnerGap } from '@phosphor-icons/react';
import {
  checkAvailability,
  getQuote,
  type PublicRoomType,
  type QuoteResult,
} from '@/lib/api/rooms';
import { createBooking, createPaymentOrder } from '@/lib/api/bookings';
import { useRazorpay } from '@/hooks/use-razorpay';
import { toast } from '@/store/toast';
import { formatMoney, todayISO, addDaysISO } from '@/lib/format';
import { ApiClientError } from '@/lib/api/client';

export function BookingWidget({ room }: { room: PublicRoomType }) {
  const router = useRouter();
  const { openCheckout } = useRazorpay();

  const [dateFrom, setDateFrom] = useState(addDaysISO(todayISO(), 1));
  const [dateTo, setDateTo] = useState(addDaysISO(todayISO(), 2));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [available, setAvailable] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState<'dates' | 'guest'>('dates');

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [requests, setRequests] = useState('');
  const [promo, setPromo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onCheck() {
    if (new Date(dateTo) <= new Date(dateFrom)) {
      toast.error('Check-out must be after check-in');
      return;
    }
    setChecking(true);
    setQuote(null);
    setAvailable(null);
    try {
      const [avail, q] = await Promise.all([
        checkAvailability(room.id, dateFrom, dateTo),
        getQuote(room.id, dateFrom, dateTo),
      ]);
      setAvailable(avail.available);
      setQuote(q);
      if (avail.available > 0) setStep('guest');
      else toast.info('Sold out', 'No rooms of this type are free for those dates.');
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : 'Could not check availability');
    } finally {
      setChecking(false);
    }
  }

  async function onReserve() {
    if (!contact.name || !contact.email || !contact.phone) {
      toast.error('Please fill in your name, email and phone');
      return;
    }
    setSubmitting(true);
    try {
      const booking = await createBooking({
        contact,
        rooms: [{ roomType: room.id, dateFrom, dateTo, adults, children }],
        promoCode: promo || undefined,
        paymentType: 'Full',
        specialRequests: requests || undefined,
      });

      try {
        const order = await createPaymentOrder(booking.id);
        await openCheckout(order, {
          onSuccess: () => router.push(`/booking/${booking.bookingRef}?paid=1`),
          onDismiss: () => {
            toast.info(
              'Payment cancelled',
              `Your reservation ${booking.bookingRef} is held briefly.`,
            );
            router.push(`/booking/${booking.bookingRef}`);
          },
        });
      } catch (payErr) {
        // Razorpay not configured (or load failed) — booking is held; show confirmation.
        toast.info('Reservation held', `Complete payment for ${booking.bookingRef} to confirm.`);
        router.push(`/booking/${booking.bookingRef}`);
        void payErr;
      }
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : 'Could not create your reservation');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent';
  const labelCls = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
      <div className="mb-5 flex items-baseline justify-between">
        <span className="font-display text-2xl">{formatMoney(room.basePrice, room.currency)}</span>
        <span className="text-sm text-muted-foreground">per night</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Check in</label>
          <input
            type="date"
            className={fieldCls}
            min={todayISO()}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Check out</label>
          <input
            type="date"
            className={fieldCls}
            min={addDaysISO(dateFrom, 1)}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Adults</label>
          <select
            className={fieldCls}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
          >
            {Array.from({ length: room.maxAdults }).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Children</label>
          <select
            className={fieldCls}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
          >
            {Array.from({ length: room.maxChildren + 1 }).map((_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {quote && (
        <div className="mt-5 space-y-2 rounded-xl bg-surface-sunken p-4 text-sm">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} weight="fill" />
            {available} room{available === 1 ? '' : 's'} available · {quote.nights} night
            {quote.nights === 1 ? '' : 's'}
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatMoney(quote.subtotal, quote.currency)}</span>
          </div>
        </div>
      )}

      {step === 'guest' && (available ?? 0) > 0 && (
        <div className="mt-5 space-y-3">
          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={fieldCls}
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={fieldCls}
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={fieldCls}
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="9XXXXXXXXX"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Promo code (optional)</label>
            <input
              className={`${fieldCls} uppercase`}
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="SAVE10"
            />
          </div>
          <div>
            <label className={labelCls}>Special requests (optional)</label>
            <textarea
              className={fieldCls}
              rows={2}
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
            />
          </div>
        </div>
      )}

      <button
        onClick={step === 'dates' ? onCheck : onReserve}
        disabled={checking || submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {(checking || submitting) && <SpinnerGap size={18} className="animate-spin" />}
        {step === 'dates' ? (
          <>
            <CalendarBlank size={18} /> Check availability
          </>
        ) : (
          <>
            <Users size={18} /> Reserve &amp; pay
          </>
        )}
      </button>

      {step === 'guest' && (
        <button
          onClick={() => setStep('dates')}
          className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Change dates
        </button>
      )}
    </div>
  );
}
