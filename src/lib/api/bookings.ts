import { api } from './client';

export interface BookedRoomDTO {
  roomTypeName: string;
  unitNumber: string;
  dateFrom: string;
  dateTo: string;
  nights: number;
  adults: number;
  children: number;
  subtotal: number;
}

export interface BookingResult {
  id: string;
  bookingRef: string;
  status: string;
  contact: { name: string; email: string; phone: string };
  rooms: BookedRoomDTO[];
  pricing: { roomsSubtotal: number; discount: number; total: number; currency: string };
  payment: { type: string; amountDue: number; amountPaid: number; status: string };
  statusTimeline: { status: string; at: string; note: string }[];
}

export interface CreateBookingPayload {
  contact: { name: string; email: string; phone: string };
  rooms: { roomType: string; dateFrom: string; dateTo: string; adults: number; children: number }[];
  promoCode?: string;
  paymentType?: 'Full' | 'Deposit';
  specialRequests?: string;
}

export function createBooking(payload: CreateBookingPayload): Promise<BookingResult> {
  return api.post<BookingResult>('/bookings', payload);
}

export function getPublicBooking(ref: string): Promise<BookingResult> {
  return api.get<BookingResult>(`/public/bookings/${encodeURIComponent(ref)}`);
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  keyId: string;
  bookingRef: string;
  bookingId: string;
  prefill: { name: string; email: string; contact: string };
}

export function createPaymentOrder(bookingId: string): Promise<RazorpayOrder> {
  return api.post<RazorpayOrder>('/payments/razorpay/order', { bookingId });
}
