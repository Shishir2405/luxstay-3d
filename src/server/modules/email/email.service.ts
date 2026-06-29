import 'server-only';
import { getSettings } from '@/server/modules/settings/settings.service';
import { EMAIL_PROVIDER, APP_NAME, type EmailProviderName } from '@/lib/constants';
import { logger } from '@/server/utils/logger';
import type { EmailMessage, EmailProvider } from './email-provider';
import { GmailSmtpProvider } from './gmail-smtp.provider';
import { BrevoProvider } from './brevo.provider';

/** Result of an attempted send. Never throws to the caller — flows must not break on email failure. */
export interface SendResult {
  ok: boolean;
  provider?: string;
}

interface ResolvedEmailConfig {
  activeProvider: EmailProviderName;
  fromName: string;
  fromEmail: string;
  fallbackEnabled: boolean;
}

/** Loosely-typed booking shape — avoids a hard dependency on the booking model. */
interface BookingLike {
  bookingRef?: string;
  status?: string;
  total?: number;
  currency?: string;
  contact?: { name?: string; email?: string } | null;
  items?: Array<{ roomTypeName?: string; nights?: number; quantity?: number; price?: number }>;
  [key: string]: unknown;
}

/** Loosely-typed RSVP shape — avoids a hard dependency on the rsvp model. */
interface RsvpLike {
  rsvpCode?: string;
  status?: string;
  eventName?: string;
  partySize?: number;
  date?: string | Date;
  contact?: { name?: string; email?: string } | null;
  [key: string]: unknown;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wraps content in a minimal branded shell shared by all transactional emails. */
function brandedShell(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0b0f;color:#e7e7ea;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:18px;letter-spacing:.08em;text-transform:uppercase;color:#c9a86a;margin:0 0 24px;">${escapeHtml(
        APP_NAME,
      )}</h1>
      <h2 style="font-size:22px;margin:0 0 16px;color:#ffffff;">${escapeHtml(heading)}</h2>
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#8a8a90;">This is an automated message from ${escapeHtml(
        APP_NAME,
      )}.</p>
    </div>
  </body>
</html>`;
}

function instantiate(
  provider: EmailProviderName,
  config: ResolvedEmailConfig,
): EmailProvider | null {
  if (provider === EMAIL_PROVIDER.GMAIL_SMTP) {
    const user = process.env.GMAIL_SMTP_USER;
    const pass = process.env.GMAIL_SMTP_PASS;
    if (!user || !pass) {
      logger.warn('email', 'GmailSmtp credentials missing (GMAIL_SMTP_USER/GMAIL_SMTP_PASS)');
      return null;
    }
    return new GmailSmtpProvider({
      user,
      pass,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    });
  }

  if (provider === EMAIL_PROVIDER.BREVO) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      logger.warn('email', 'Brevo credentials missing (BREVO_API_KEY)');
      return null;
    }
    return new BrevoProvider({
      apiKey,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    });
  }

  return null;
}

function otherProvider(active: EmailProviderName): EmailProviderName {
  return active === EMAIL_PROVIDER.GMAIL_SMTP ? EMAIL_PROVIDER.BREVO : EMAIL_PROVIDER.GMAIL_SMTP;
}

async function trySend(provider: EmailProvider | null, msg: EmailMessage): Promise<boolean> {
  if (!provider) return false;
  try {
    await provider.send(msg);
    logger.info('email', `sent via ${provider.name} to ${msg.to}`);
    return true;
  } catch (error) {
    logger.error('email', `send failed via ${provider.name}`, error);
    return false;
  }
}

export const emailService = {
  /**
   * Reads the live `email` settings + env credentials, sends via the active
   * provider, and (when enabled) retries via the other on failure. Swallows
   * all errors and returns `{ ok }` so callers' flows never break on email.
   */
  async send(msg: EmailMessage): Promise<SendResult> {
    const settings = await getSettings('email');
    const config: ResolvedEmailConfig = {
      activeProvider: settings.activeProvider as EmailProviderName,
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
      fallbackEnabled: settings.fallbackEnabled,
    };

    const active = instantiate(config.activeProvider, config);
    if (await trySend(active, msg)) {
      return { ok: true, provider: active?.name };
    }

    if (config.fallbackEnabled) {
      const fallbackName = otherProvider(config.activeProvider);
      const fallback = instantiate(fallbackName, config);
      if (await trySend(fallback, msg)) {
        return { ok: true, provider: fallback?.name };
      }
    }

    logger.error('email', `all providers failed for ${msg.to}`);
    return { ok: false };
  },

  /** Renders a branded booking confirmation and sends it to the booking contact. */
  async sendBookingConfirmation(booking: BookingLike): Promise<SendResult> {
    const to = booking.contact?.email;
    if (!to) {
      logger.warn('email', 'sendBookingConfirmation skipped: missing contact email');
      return { ok: false };
    }

    const currency = escapeHtml(booking.currency ?? 'INR');
    const lines = (booking.items ?? [])
      .map((item) => {
        const name = escapeHtml(item.roomTypeName ?? 'Room');
        const qty = item.quantity ?? 1;
        const nights = item.nights ?? 1;
        const price = item.price ?? 0;
        return `<tr>
          <td style="padding:6px 0;color:#e7e7ea;">${name} × ${qty} · ${nights} night(s)</td>
          <td style="padding:6px 0;text-align:right;color:#e7e7ea;">${currency} ${escapeHtml(price)}</td>
        </tr>`;
      })
      .join('');

    const body = `
      <p style="color:#c2c2c8;">Hi ${escapeHtml(booking.contact?.name ?? 'Guest')}, your booking is ${escapeHtml(
        booking.status ?? 'confirmed',
      )}.</p>
      <p style="color:#c2c2c8;">Booking reference: <strong style="color:#c9a86a;">${escapeHtml(
        booking.bookingRef ?? '—',
      )}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #26262c;">
        ${lines || '<tr><td style="padding:6px 0;color:#8a8a90;">No room lines available.</td></tr>'}
        <tr>
          <td style="padding:12px 0;border-top:1px solid #26262c;font-weight:bold;color:#ffffff;">Total</td>
          <td style="padding:12px 0;border-top:1px solid #26262c;text-align:right;font-weight:bold;color:#ffffff;">${currency} ${escapeHtml(
            booking.total ?? 0,
          )}</td>
        </tr>
      </table>`;

    return this.send({
      to,
      subject: `Your ${APP_NAME} booking ${booking.bookingRef ?? ''}`.trim(),
      html: brandedShell('Booking confirmed', body),
    });
  },

  /** Renders a branded RSVP confirmation and sends it to the RSVP contact. */
  async sendRsvpConfirmation(rsvp: RsvpLike): Promise<SendResult> {
    const to = rsvp.contact?.email;
    if (!to) {
      logger.warn('email', 'sendRsvpConfirmation skipped: missing contact email');
      return { ok: false };
    }

    const when = rsvp.date ? new Date(rsvp.date).toLocaleString() : '—';
    const body = `
      <p style="color:#c2c2c8;">Hi ${escapeHtml(rsvp.contact?.name ?? 'Guest')}, your RSVP is ${escapeHtml(
        rsvp.status ?? 'confirmed',
      )}.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #26262c;">
        <tr><td style="padding:6px 0;color:#8a8a90;">Event</td><td style="padding:6px 0;text-align:right;color:#e7e7ea;">${escapeHtml(
          rsvp.eventName ?? '—',
        )}</td></tr>
        <tr><td style="padding:6px 0;color:#8a8a90;">When</td><td style="padding:6px 0;text-align:right;color:#e7e7ea;">${escapeHtml(
          when,
        )}</td></tr>
        <tr><td style="padding:6px 0;color:#8a8a90;">Party size</td><td style="padding:6px 0;text-align:right;color:#e7e7ea;">${escapeHtml(
          rsvp.partySize ?? 1,
        )}</td></tr>
        <tr><td style="padding:6px 0;color:#8a8a90;">Reference</td><td style="padding:6px 0;text-align:right;color:#c9a86a;">${escapeHtml(
          rsvp.rsvpCode ?? '—',
        )}</td></tr>
      </table>`;

    return this.send({
      to,
      subject: `Your ${APP_NAME} RSVP ${rsvp.rsvpCode ?? ''}`.trim(),
      html: brandedShell('RSVP confirmed', body),
    });
  },
};
