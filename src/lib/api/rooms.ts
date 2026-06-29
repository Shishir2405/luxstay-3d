import { api, apiList } from './client';
import type { Paginated } from '@/lib/types';

export interface PublicRoomImage {
  url: string;
  alt: string;
  sortOrder: number;
}
export interface PublicAmenity {
  id: string;
  name: string;
  icon: string;
}
export interface PublicRoomType {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  currency: string;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  view: string;
  sizeSqft: number;
  images: PublicRoomImage[];
  amenities: PublicAmenity[];
  model3dUrl?: string;
  isFeatured: boolean;
}

export interface AvailabilityResult {
  roomType: string;
  dateFrom: string;
  dateTo: string;
  available: number;
  units: { id: string; unitNumber: string; floor: number }[];
}

export interface QuoteResult {
  nights: number;
  perNight: { date: string; price: number; ruleName: string | null }[];
  subtotal: number;
  currency: string;
}

export function listPublicRooms(
  query?: Record<string, string | number | undefined>,
): Promise<Paginated<PublicRoomType>> {
  return apiList<PublicRoomType>('/public/room-types', { query });
}

export function getPublicRoom(slug: string): Promise<PublicRoomType> {
  return api.get<PublicRoomType>(`/public/room-types/${encodeURIComponent(slug)}`);
}

export function checkAvailability(
  roomTypeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<AvailabilityResult> {
  return api.get<AvailabilityResult>(`/room-types/${roomTypeId}/availability`, {
    query: { dateFrom, dateTo },
  });
}

export function getQuote(
  roomTypeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<QuoteResult> {
  return api.get<QuoteResult>(`/room-types/${roomTypeId}/quote`, { query: { dateFrom, dateTo } });
}
