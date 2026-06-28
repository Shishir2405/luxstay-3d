import 'server-only';
import { promoRepository } from './promo.repository';
import { ApiError } from '@/server/utils/api-error';
import { DISCOUNT_TYPE } from '@/lib/constants';

export interface ApplyPromoInput {
  code: string;
  roomTypeId: string;
  nights: number;
  amount: number; // pre-discount subtotal
}

export interface PromoResult {
  promoId: string;
  code: string;
  discount: number;
  finalAmount: number;
}

export const promoService = {
  list(filter: Parameters<typeof promoRepository.list>[0]) {
    return promoRepository.list(filter);
  },

  async getById(id: string) {
    const doc = await promoRepository.findById(id);
    if (!doc) throw ApiError.notFound('Promo code not found');
    return doc;
  },

  async create(input: Record<string, unknown> & { code: string }, actorId: string | null) {
    const existing = await promoRepository.findByCode(input.code);
    if (existing) throw ApiError.conflict('A promo code with this code already exists');
    return promoRepository.create({ ...input, code: input.code.toUpperCase(), createdBy: actorId });
  },

  async update(id: string, input: Record<string, unknown>, actorId: string | null) {
    const doc = await promoRepository.findById(id);
    if (!doc) throw ApiError.notFound('Promo code not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    if (typeof input.code === 'string') doc.code = input.code.toUpperCase();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await promoRepository.findById(id);
    if (!doc) throw ApiError.notFound('Promo code not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },

  /** Validates a code against the cart and returns the discount (does not redeem). */
  async apply(input: ApplyPromoInput): Promise<PromoResult> {
    const promo = await promoRepository.findByCode(input.code);
    if (!promo || !promo.isActive) throw ApiError.badRequest('Invalid or inactive promo code');

    const now = new Date();
    if (promo.validFrom && now < promo.validFrom)
      throw ApiError.badRequest('This promo code is not active yet');
    if (promo.validTo && now > promo.validTo)
      throw ApiError.badRequest('This promo code has expired');
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      throw ApiError.badRequest('This promo code has reached its usage limit');
    }
    if (promo.minNights > 0 && input.nights < promo.minNights) {
      throw ApiError.badRequest(`Requires a minimum stay of ${promo.minNights} nights`);
    }
    if (promo.minAmount > 0 && input.amount < promo.minAmount) {
      throw ApiError.badRequest(`Requires a minimum spend of ${promo.minAmount}`);
    }
    if (
      promo.roomTypes.length > 0 &&
      !promo.roomTypes.some((rt) => String(rt) === input.roomTypeId)
    ) {
      throw ApiError.badRequest('This promo code does not apply to the selected room');
    }

    let discount =
      promo.discountType === DISCOUNT_TYPE.PERCENTAGE
        ? (input.amount * promo.value) / 100
        : promo.value;
    if (promo.maxDiscount > 0) discount = Math.min(discount, promo.maxDiscount);
    discount = Math.min(discount, input.amount);
    discount = Math.round(discount * 100) / 100;

    return {
      promoId: promo._id.toString(),
      code: promo.code,
      discount,
      finalAmount: Math.round((input.amount - discount) * 100) / 100,
    };
  },

  /** Atomically consumes one use of the code (called when a booking is confirmed). */
  async redeem(promoId: string) {
    const updated = await promoRepository.redeem(promoId);
    if (!updated) throw ApiError.conflict('Promo code usage limit reached');
    return updated;
  },
};
