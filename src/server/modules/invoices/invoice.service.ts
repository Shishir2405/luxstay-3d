import 'server-only';
import { APP_NAME } from '@/lib/constants';
import type { BookingAttrs, BookedRoom } from '@/server/models/booking.model';

/** Minimal view of a booking needed to render an invoice (subset of BookingAttrs). */
type InvoiceBooking = Pick<
  BookingAttrs,
  'bookingRef' | 'contact' | 'rooms' | 'pricing' | 'payment'
> & { createdAt?: Date };

/** Escapes user-supplied text so it is safe to interpolate into HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${esc(currency)} ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function roomRow(room: BookedRoom, currency: string): string {
  return `
        <tr>
          <td>
            <strong>${esc(room.roomTypeName)}</strong>
            <div class="muted">Room ${esc(room.unitNumber)}</div>
          </td>
          <td>${esc(formatDate(room.dateFrom))} &rarr; ${esc(formatDate(room.dateTo))}</td>
          <td class="num">${esc(room.nights)}</td>
          <td class="num">${money(room.subtotal, currency)}</td>
        </tr>`;
}

/**
 * Renders a clean, branded, self-contained HTML invoice for a booking. The
 * browser's print-to-PDF produces the downloadable document (no Puppeteer).
 */
export function renderInvoiceHtml(booking: InvoiceBooking): string {
  const { pricing, payment, contact } = booking;
  const currency = pricing.currency;
  const rows = booking.rooms.map((room) => roomRow(room, currency)).join('');
  const issuedAt = booking.createdAt ? formatDate(booking.createdAt) : formatDate(new Date());

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${esc(booking.bookingRef)} — ${esc(APP_NAME)}</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        color: #1a1a1a;
        background: #f4f4f5;
        margin: 0;
        padding: 32px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .invoice {
        max-width: 720px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 32px;
        background: #0f172a;
        color: #ffffff;
      }
      .brand { font-size: 22px; font-weight: 700; letter-spacing: 0.04em; }
      .brand .tag { display: block; font-size: 12px; font-weight: 400; opacity: 0.7; margin-top: 4px; }
      .doc-meta { text-align: right; font-size: 13px; }
      .doc-meta .label { opacity: 0.7; }
      .doc-meta .ref { font-size: 16px; font-weight: 600; }
      .body { padding: 32px; }
      .parties { display: flex; gap: 32px; margin-bottom: 24px; }
      .parties h3 {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin: 0 0 8px;
      }
      .parties p { margin: 2px 0; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th {
        text-align: left;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        border-bottom: 2px solid #e2e8f0;
        padding: 10px 8px;
      }
      td { padding: 14px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
      .num { text-align: right; white-space: nowrap; }
      .muted { color: #64748b; font-size: 12px; margin-top: 2px; }
      .totals { margin-top: 24px; margin-left: auto; width: 280px; font-size: 14px; }
      .totals .line { display: flex; justify-content: space-between; padding: 6px 0; }
      .totals .grand {
        border-top: 2px solid #0f172a;
        margin-top: 8px;
        padding-top: 12px;
        font-size: 16px;
        font-weight: 700;
      }
      .status {
        display: inline-block;
        margin-top: 24px;
        padding: 6px 14px;
        border-radius: 999px;
        background: #ecfdf5;
        color: #047857;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .footer {
        padding: 20px 32px;
        border-top: 1px solid #f1f5f9;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
      }
      @media print {
        body { background: #ffffff; padding: 0; }
        .invoice { box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="invoice">
      <div class="header">
        <div class="brand">${esc(APP_NAME)}<span class="tag">Reservation Invoice</span></div>
        <div class="doc-meta">
          <div class="label">Booking Reference</div>
          <div class="ref">${esc(booking.bookingRef)}</div>
          <div class="label" style="margin-top: 8px;">Issued ${esc(issuedAt)}</div>
        </div>
      </div>
      <div class="body">
        <div class="parties">
          <div>
            <h3>Billed To</h3>
            <p><strong>${esc(contact.name)}</strong></p>
            <p>${esc(contact.email)}</p>
            <p>${esc(contact.phone)}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Stay Dates</th>
              <th class="num">Nights</th>
              <th class="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div class="line">
            <span>Subtotal</span>
            <span>${money(pricing.roomsSubtotal, currency)}</span>
          </div>
          <div class="line">
            <span>Discount${pricing.promoCode ? ` (${esc(pricing.promoCode)})` : ''}</span>
            <span>&minus;${money(pricing.discount, currency)}</span>
          </div>
          <div class="line grand">
            <span>Total</span>
            <span>${money(pricing.total, currency)}</span>
          </div>
        </div>
        <span class="status">Payment ${esc(payment.status)}</span>
      </div>
      <div class="footer">
        Thank you for choosing ${esc(APP_NAME)}. This is a computer-generated invoice.
      </div>
    </div>
  </body>
</html>`;
}
