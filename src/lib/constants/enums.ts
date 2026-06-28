/** Domain enums shared across server and client. `as const` for ergonomic imports. */

export const ROOM_UNIT_STATUS = {
  AVAILABLE: 'Available',
  BOOKED: 'Booked',
  MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'OutOfService',
} as const;
export type RoomUnitStatus = (typeof ROOM_UNIT_STATUS)[keyof typeof ROOM_UNIT_STATUS];

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'CheckedIn',
  CHECKED_OUT: 'CheckedOut',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow',
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  CREATED: 'Created',
  AUTHORIZED: 'Authorized',
  CAPTURED: 'Captured',
  PARTIALLY_PAID: 'PartiallyPaid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'PartiallyRefunded',
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_TYPE = {
  FULL: 'Full',
  DEPOSIT: 'Deposit',
  BALANCE: 'Balance',
} as const;
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export const RSVP_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  WAITLISTED: 'Waitlisted',
  CHECKED_IN: 'CheckedIn',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow',
} as const;
export type RsvpStatus = (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS];

export const RSVP_TIER = {
  GENERAL: 'General',
  VIP: 'VIP',
  TABLE_SERVICE: 'TableService',
} as const;
export type RsvpTier = (typeof RSVP_TIER)[keyof typeof RSVP_TIER];

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'Percentage',
  FLAT: 'Flat',
} as const;
export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export const PRICING_RULE_KIND = {
  SEASONAL: 'Seasonal',
  WEEKEND: 'Weekend',
  HOLIDAY: 'Holiday',
  PROMO: 'Promo',
} as const;
export type PricingRuleKind = (typeof PRICING_RULE_KIND)[keyof typeof PRICING_RULE_KIND];

export const EMAIL_PROVIDER = {
  GMAIL_SMTP: 'GmailSmtp',
  BREVO: 'Brevo',
} as const;
export type EmailProviderName = (typeof EMAIL_PROVIDER)[keyof typeof EMAIL_PROVIDER];

export const AUDIT_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  REFUND: 'refund',
  CHECK_IN: 'check-in',
} as const;
export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export const REVIEW_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

/** Public 3D tour zones — used for engagement analytics and navigation state. */
export const TOUR_ZONES = [
  'entrance',
  'reception',
  'rooms',
  'restaurant',
  'bar',
  'events',
  'rooftop',
  'pool',
] as const;
export type TourZone = (typeof TOUR_ZONES)[number];
