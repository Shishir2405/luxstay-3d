import 'server-only';
import { PaymentTransactionModel } from '@/server/models/payment-transaction.model';
import { bookingRepository } from '@/server/modules/bookings/booking.repository';
import { bookingService } from '@/server/modules/bookings/booking.service';
import { getRazorpayClient, getRazorpayCreds, verifyWebhookSignature } from './razorpay.client';
import { ApiError } from '@/server/utils/api-error';
import { logger } from '@/server/utils/logger';
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/lib/constants';

export interface OrderResult {
  orderId: string;
  amount: number; // major units
  amountPaise: number;
  currency: string;
  keyId: string;
  bookingRef: string;
  bookingId: string;
  prefill: { name: string; email: string; contact: string };
}

export const paymentService = {
  /** Creates a server-side Razorpay order for a booking's amount due. */
  async createOrder(bookingId: string): Promise<OrderResult> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BOOKING_STATUS.CANCELLED)
      throw ApiError.conflict('This booking was cancelled');
    if (booking.payment.amountDue <= 0) throw ApiError.conflict('Nothing is due on this booking');

    const amount = booking.payment.amountDue;
    const amountPaise = Math.round(amount * 100);
    const { keyId } = await getRazorpayCreds();
    const client = await getRazorpayClient();

    const order = await client.orders.create({
      amount: amountPaise,
      currency: booking.pricing.currency,
      receipt: booking.bookingRef,
      notes: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
    });

    await PaymentTransactionModel.create({
      booking: booking._id,
      bookingRef: booking.bookingRef,
      provider: 'razorpay',
      razorpayOrderId: order.id,
      amount,
      currency: booking.pricing.currency,
      type: booking.payment.type,
      status: PAYMENT_STATUS.CREATED,
    });

    return {
      orderId: order.id,
      amount,
      amountPaise,
      currency: booking.pricing.currency,
      keyId,
      bookingRef: booking.bookingRef,
      bookingId: String(booking._id),
      prefill: {
        name: booking.contact.name,
        email: booking.contact.email,
        contact: booking.contact.phone,
      },
    };
  },

  /**
   * Processes a Razorpay webhook. Verifies the signature against the RAW body
   * (server-side source of truth), then — only for a captured payment —
   * confirms the booking. Idempotent: a replayed webhook is a no-op.
   */
  async handleWebhook(
    rawBody: string,
    signature: string,
  ): Promise<{ handled: boolean; event?: string }> {
    const { webhookSecret } = await getRazorpayCreds();
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      throw ApiError.unauthorized('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: Record<string, unknown> } };
    };

    const entity = event.payload?.payment?.entity;

    if (event.event === 'payment.captured' && entity) {
      const orderId = String(entity.order_id ?? '');
      const paymentId = String(entity.id ?? '');
      const amount = Number(entity.amount ?? 0) / 100; // paise → major
      const method = String(entity.method ?? '');

      const tx = await PaymentTransactionModel.findOne({ razorpayOrderId: orderId });
      if (!tx) {
        logger.warn('payments', `webhook for unknown order ${orderId}`);
        return { handled: false, event: event.event };
      }
      if (tx.status === PAYMENT_STATUS.CAPTURED) {
        return { handled: true, event: event.event }; // idempotent replay
      }

      tx.status = PAYMENT_STATUS.CAPTURED;
      tx.razorpayPaymentId = paymentId;
      tx.method = method;
      tx.raw = entity;
      await tx.save();

      await bookingService.confirmPayment(String(tx.booking), amount);
      logger.info('payments', `captured ${amount} for booking ${tx.bookingRef}`);
      return { handled: true, event: event.event };
    }

    if (event.event === 'payment.failed' && entity) {
      const orderId = String(entity.order_id ?? '');
      const tx = await PaymentTransactionModel.findOne({ razorpayOrderId: orderId });
      if (tx && tx.status !== PAYMENT_STATUS.CAPTURED) {
        tx.status = PAYMENT_STATUS.FAILED;
        tx.errorMessage = String(entity.error_description ?? 'Payment failed');
        tx.raw = entity;
        await tx.save();
      }
      return { handled: true, event: event.event };
    }

    return { handled: false, event: event.event };
  },

  /** Admin-initiated refund via Razorpay Refunds API. */
  async refund(bookingId: string, amount: number, reason: string) {
    const tx = await PaymentTransactionModel.findOne({
      booking: bookingId,
      status: { $in: [PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.PARTIALLY_REFUNDED] },
    }).sort({ createdAt: -1 });
    if (!tx || !tx.razorpayPaymentId)
      throw ApiError.conflict('No captured payment to refund for this booking');

    const refundable = tx.amount - tx.refunds.reduce((s, r) => s + r.amount, 0);
    if (amount > refundable) throw ApiError.badRequest(`At most ${refundable} can be refunded`);

    const client = await getRazorpayClient();
    const refund = await client.payments.refund(tx.razorpayPaymentId, {
      amount: Math.round(amount * 100),
      notes: { reason },
    });

    tx.refunds.push({
      razorpayRefundId: refund.id,
      amount,
      status: String(refund.status ?? 'processed'),
      reason,
      at: new Date(),
    });
    const totalRefunded = tx.refunds.reduce((s, r) => s + r.amount, 0);
    tx.status =
      totalRefunded >= tx.amount ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED;
    await tx.save();

    return { refundId: refund.id, amount, status: tx.status };
  },
};
