import 'server-only';
import { Types } from 'mongoose';
import { bookingRepository, type BookingListFilter } from './booking.repository';
import { availabilityService } from '@/server/modules/rooms/availability.service';
import { pricingService } from '@/server/modules/rooms/pricing.service';
import { promoService } from '@/server/modules/rooms/promo.service';
import { emailService } from '@/server/modules/email/email.service';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { getSettings } from '@/server/modules/settings/settings.service';
import { ApiError } from '@/server/utils/api-error';
import { generateRefCode } from '@/server/utils/ref-code';
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_TYPE } from '@/lib/constants';
import type { BookedRoom, BookingDoc } from '@/server/models/booking.model';
import type { CreateBookingInput } from '@/lib/validators/bookings';

const HOLD_TTL_MS = 15 * 60_000; // checkout window before a hold auto-expires

interface Actor {
  id: string | null;
  name: string;
}

async function uniqueBookingRef(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const ref = generateRefCode('LX');
    if (!(await bookingRepository.refExists(ref))) return ref;
  }
  return generateRefCode('LX', 8);
}

export const bookingService = {
  list(filter: BookingListFilter) {
    return bookingRepository.list(filter);
  },

  async getById(id: string) {
    const doc = await bookingRepository.findById(id);
    if (!doc) throw ApiError.notFound('Booking not found');
    return doc;
  },

  async getByRef(ref: string) {
    const doc = await bookingRepository.findByRef(ref);
    if (!doc) throw ApiError.notFound('Booking not found');
    return doc;
  },

  /**
   * Creates a PENDING booking. For each requested room it quotes the stay and
   * atomically acquires a per-night hold (overbooking-safe). Group bookings are
   * all-or-nothing: if any room can't be held, every hold acquired in this
   * attempt is released and the whole request fails. Payment is collected next;
   * the holds expire automatically (TTL) if checkout is abandoned.
   */
  async create(
    input: CreateBookingInput,
    actor: Actor,
    source: 'web' | 'admin',
  ): Promise<BookingDoc> {
    const paymentSettings = await getSettings('payments');

    const acquiredHolds: string[] = [];
    const bookedRooms: BookedRoom[] = [];
    let currency = String(paymentSettings.currency ?? 'INR');

    try {
      for (const sel of input.rooms) {
        const roomType = await RoomTypeModel.findOne({
          _id: sel.roomType,
          isDeleted: false,
        }).lean();
        if (!roomType) throw ApiError.badRequest('Selected room type not found');
        if (!roomType.isActive)
          throw ApiError.badRequest(`${roomType.name} is not currently bookable`);
        if (sel.adults > roomType.maxAdults) {
          throw ApiError.badRequest(`${roomType.name} allows at most ${roomType.maxAdults} adults`);
        }
        if (sel.children > roomType.maxChildren) {
          throw ApiError.badRequest(
            `${roomType.name} allows at most ${roomType.maxChildren} children`,
          );
        }

        const quote = await pricingService.quoteStay(sel.roomType, sel.dateFrom, sel.dateTo);
        const hold = await availabilityService.acquireUnitHold(
          sel.roomType,
          sel.dateFrom,
          sel.dateTo,
          HOLD_TTL_MS,
          actor.id,
        );
        acquiredHolds.push(hold._id);
        currency = quote.currency;

        bookedRooms.push({
          roomType: new Types.ObjectId(sel.roomType),
          roomTypeName: roomType.name,
          roomUnit: new Types.ObjectId(hold.roomUnit),
          unitNumber: hold.unitNumber,
          dateFrom: sel.dateFrom,
          dateTo: sel.dateTo,
          nights: quote.nights,
          adults: sel.adults,
          children: sel.children,
          perNight: quote.perNight.map((n) => ({ date: n.date, price: n.price })),
          subtotal: quote.subtotal,
          holdRef: new Types.ObjectId(hold._id),
        });
      }

      const roomsSubtotal = bookedRooms.reduce((sum, r) => sum + r.subtotal, 0);

      let discount = 0;
      let promoCode: string | null = null;
      if (input.promoCode) {
        const totalNights = bookedRooms.reduce((s, r) => s + r.nights, 0);
        const res = await promoService.apply({
          code: input.promoCode,
          roomTypeId: String(bookedRooms[0]!.roomType),
          nights: totalNights,
          amount: roomsSubtotal,
        });
        discount = res.discount;
        promoCode = res.code;
      }

      const taxes = 0; // GST hook — wire to a configurable rate later
      const total = Math.max(0, roomsSubtotal - discount + taxes);

      const depositPct = Number(paymentSettings.depositPercentage ?? 20);
      const isDeposit = input.paymentType === PAYMENT_TYPE.DEPOSIT;
      const depositAmount = isDeposit ? Math.round((total * depositPct) / 100) : total;

      const booking = await bookingRepository.create({
        bookingRef: await uniqueBookingRef(),
        user: actor.id,
        contact: input.contact,
        rooms: bookedRooms,
        status: BOOKING_STATUS.PENDING,
        statusTimeline: [
          {
            status: BOOKING_STATUS.PENDING,
            at: new Date(),
            note: 'Reservation created — awaiting payment',
            byName: actor.name || input.contact.name,
          },
        ],
        pricing: { roomsSubtotal, discount, promoCode, taxes, total, currency },
        payment: {
          type: input.paymentType,
          depositAmount,
          amountPaid: 0,
          amountDue: depositAmount,
          status: PAYMENT_STATUS.CREATED,
        },
        source,
        specialRequests: input.specialRequests ?? '',
        createdBy: actor.id,
      });

      return booking;
    } catch (err) {
      // Roll back every hold acquired during this attempt.
      await Promise.allSettled(acquiredHolds.map((h) => availabilityService.releaseHold(h)));
      throw err;
    }
  },

  /**
   * Confirms a booking after a verified payment (called by the Razorpay webhook).
   * Promotes each room's hold to a permanent booking lock and advances status.
   */
  async confirmPayment(bookingId: string, amountPaid: number): Promise<BookingDoc> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw ApiError.conflict('This booking was already cancelled');
    }

    for (const room of booking.rooms) {
      await availabilityService.confirmHold(String(room.holdRef), bookingId);
    }

    booking.payment.amountPaid += amountPaid;
    booking.payment.amountDue = Math.max(0, booking.pricing.total - booking.payment.amountPaid);
    booking.payment.status =
      booking.payment.amountPaid >= booking.pricing.total
        ? PAYMENT_STATUS.CAPTURED
        : PAYMENT_STATUS.PARTIALLY_PAID;
    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.statusTimeline.push({
      status: BOOKING_STATUS.CONFIRMED,
      at: new Date(),
      note: `Payment received (${booking.pricing.currency} ${amountPaid})`,
      byName: 'system',
    });
    await booking.save();

    // Redeem the promo on successful payment (not at hold time).
    if (booking.pricing.promoCode && booking.rooms[0]) {
      try {
        const res = await promoService.apply({
          code: booking.pricing.promoCode,
          roomTypeId: String(booking.rooms[0].roomType),
          nights: booking.rooms.reduce((s, r) => s + r.nights, 0),
          amount: booking.pricing.roomsSubtotal,
        });
        await promoService.redeem(res.promoId);
      } catch {
        /* promo redemption is best-effort; never blocks confirmation */
      }
    }

    // Send the booking confirmation email (best-effort; never blocks confirmation).
    void emailService.sendBookingConfirmation(booking.toJSON());

    return booking;
  },

  /** Cancels a booking, computing the refund per the configurable policy. */
  async cancel(id: string, reason: string | undefined, actor: Actor) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status === BOOKING_STATUS.CANCELLED)
      throw ApiError.conflict('Booking is already cancelled');
    if (
      booking.status === BOOKING_STATUS.CHECKED_OUT ||
      booking.status === BOOKING_STATUS.COMPLETED
    ) {
      throw ApiError.conflict('A completed stay cannot be cancelled');
    }

    let refundAmount = 0;
    if (booking.payment.amountPaid > 0) {
      const settings = await getSettings('booking');
      const earliestCheckIn = Math.min(...booking.rooms.map((r) => r.dateFrom.getTime()));
      const hoursUntil = (earliestCheckIn - Date.now()) / 3_600_000;
      if (hoursUntil >= Number(settings.fullRefundWindowHours)) {
        refundAmount = booking.payment.amountPaid;
      } else if (hoursUntil >= Number(settings.cancellationWindowHours)) {
        refundAmount = Math.round(
          (booking.payment.amountPaid * Number(settings.partialRefundPercentage)) / 100,
        );
      }
    }

    // Free the calendar: drop confirmed booking locks and any lingering holds.
    await availabilityService.releaseBooking(id);
    await Promise.allSettled(
      booking.rooms.map((r) => availabilityService.releaseHold(String(r.holdRef))),
    );

    const before = booking.toJSON();
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancellation = { cancelledAt: new Date(), reason: reason ?? '', refundAmount };
    if (refundAmount > 0) {
      booking.payment.status =
        refundAmount >= booking.payment.amountPaid
          ? PAYMENT_STATUS.REFUNDED
          : PAYMENT_STATUS.PARTIALLY_REFUNDED;
    }
    booking.statusTimeline.push({
      status: BOOKING_STATUS.CANCELLED,
      at: new Date(),
      note: reason || 'Cancelled',
      byName: actor.name || 'system',
    });
    await booking.save();

    // The actual Razorpay refund (if refundAmount > 0) is executed by the payments module.
    return { before, after: booking.toJSON(), refundAmount };
  },

  /** Status transition with timeline entry (check-in / check-out). */
  async transition(
    id: string,
    to: typeof BOOKING_STATUS.CHECKED_IN | typeof BOOKING_STATUS.CHECKED_OUT,
    actor: Actor,
  ) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw ApiError.notFound('Booking not found');

    if (to === BOOKING_STATUS.CHECKED_IN && booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw ApiError.conflict('Only a confirmed booking can be checked in');
    }
    if (to === BOOKING_STATUS.CHECKED_OUT && booking.status !== BOOKING_STATUS.CHECKED_IN) {
      throw ApiError.conflict('Guest must be checked in before check-out');
    }

    const before = booking.toJSON();
    booking.status = to;
    booking.statusTimeline.push({
      status: to,
      at: new Date(),
      note: '',
      byName: actor.name || 'system',
    });
    await booking.save();
    return { before, after: booking.toJSON() };
  },
};
