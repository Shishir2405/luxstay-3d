'use client';

import { useCallback } from 'react';
import type { RazorpayOrder } from '@/lib/api/bookings';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutCallbacks {
  onSuccess: (res: RazorpayHandlerResponse) => void;
  onDismiss?: () => void;
}

/** Loads Razorpay Checkout and opens the payment modal for a server-created order. */
export function useRazorpay() {
  const openCheckout = useCallback(async (order: RazorpayOrder, cb: CheckoutCallbacks) => {
    const ok = await loadScript();
    if (!ok || !window.Razorpay)
      throw new Error('Could not load the payment gateway. Check your connection.');

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: 'LuxStay 3D',
      description: `Booking ${order.bookingRef}`,
      order_id: order.orderId,
      prefill: order.prefill,
      theme: { color: '#cd9b3f' },
      handler: cb.onSuccess,
      modal: { ondismiss: cb.onDismiss },
    });
    rzp.open();
  }, []);

  return { openCheckout };
}
