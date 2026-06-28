import 'server-only';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '@/server/config/env';
import { getSettings } from '@/server/modules/settings/settings.service';
import { ApiError } from '@/server/utils/api-error';

export interface RazorpayCreds {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

/** Resolves credentials from DB settings (admin-managed, masked in UI) → env fallback. */
export async function getRazorpayCreds(): Promise<RazorpayCreds> {
  const s = await getSettings('payments');
  return {
    keyId: String(s.razorpayKeyId ?? env.razorpay.keyId ?? ''),
    keySecret: String(s.razorpayKeySecret ?? env.razorpay.keySecret ?? ''),
    webhookSecret: String(s.razorpayWebhookSecret ?? env.razorpay.webhookSecret ?? ''),
  };
}

export async function getRazorpayClient(): Promise<Razorpay> {
  const { keyId, keySecret } = await getRazorpayCreds();
  if (!keyId || !keySecret) {
    throw new ApiError(
      'PAYMENT_REQUIRED',
      'Razorpay is not configured. Add keys in Settings → Payments.',
    );
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a Razorpay webhook signature (X-Razorpay-Signature header) against the
 * RAW request body. This is the SERVER-SIDE source of truth — a client "success"
 * callback is never trusted to mark a booking paid.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeEqualHex(expected, signature);
}

/** Verifies the client-side handler signature (order_id|payment_id). UX signal only. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string,
): boolean {
  if (!keySecret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqualHex(expected, signature);
}
