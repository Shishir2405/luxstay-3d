import 'server-only';
import { pricingRepository } from './pricing.repository';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { ApiError } from '@/server/utils/api-error';
import { PRICING_RULE_KIND } from '@/lib/constants';
import { eachNight, nightDow, toNightKey } from '@/server/utils/dates';
import type { PricingRuleAttrs } from '@/server/models/pricing-rule.model';

type LeanRule = PricingRuleAttrs & { _id: unknown };

/**
 * Does a rule apply to a given night? All comparisons are UTC-date-key based
 * (lexicographic 'YYYY-MM-DD' compare == chronological) so they're timezone-safe
 * and consistent with the availability ledger's night keys.
 */
function ruleMatchesNight(rule: LeanRule, nightKey: string): boolean {
  if (rule.kind === PRICING_RULE_KIND.WEEKEND) {
    return rule.daysOfWeek.includes(nightDow(nightKey));
  }
  // Seasonal / Holiday / Promo: inclusive date window
  const fromKey = rule.dateFrom ? toNightKey(rule.dateFrom) : null;
  const toKey = rule.dateTo ? toNightKey(rule.dateTo) : null;
  if (fromKey && nightKey < fromKey) return false;
  if (toKey && nightKey > toKey) return false;
  return Boolean(fromKey || toKey);
}

function applyRule(base: number, rule: LeanRule): number {
  switch (rule.adjustType) {
    case 'fixed':
      return Math.max(0, rule.value);
    case 'amount':
      return Math.max(0, base + rule.value);
    case 'percent':
    default:
      return Math.max(0, Math.round(base * (1 + rule.value / 100) * 100) / 100);
  }
}

export interface StayQuote {
  nights: number;
  perNight: { date: string; price: number; ruleName: string | null }[];
  subtotal: number;
  currency: string;
}

export const pricingService = {
  /** CRUD ----------------------------------------------------------------- */
  list(filter: Parameters<typeof pricingRepository.list>[0]) {
    return pricingRepository.list(filter);
  },

  async getById(id: string) {
    const doc = await pricingRepository.findById(id);
    if (!doc) throw ApiError.notFound('Pricing rule not found');
    return doc;
  },

  create(input: Record<string, unknown>, actorId: string | null) {
    return pricingRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Record<string, unknown>, actorId: string | null) {
    const doc = await pricingRepository.findById(id);
    if (!doc) throw ApiError.notFound('Pricing rule not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await pricingRepository.findById(id);
    if (!doc) throw ApiError.notFound('Pricing rule not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },

  /** Engine --------------------------------------------------------------- */

  /** Quotes a full stay, applying the highest-priority matching rule per night. */
  async quoteStay(roomTypeId: string, dateFrom: Date, dateTo: Date): Promise<StayQuote> {
    const roomType = await RoomTypeModel.findOne({ _id: roomTypeId, isDeleted: false }).lean();
    if (!roomType) throw ApiError.notFound('Room type not found');

    const nightKeys = eachNight(dateFrom, dateTo);
    if (nightKeys.length === 0) throw ApiError.badRequest('Check-out must be after check-in');

    const rules = (await pricingRepository.findActiveForType(roomTypeId)) as unknown as LeanRule[];

    const perNight = nightKeys.map((key) => {
      const match = rules.find((r) => ruleMatchesNight(r, key)); // already sorted by priority desc
      const price = match ? applyRule(roomType.basePrice, match) : roomType.basePrice;
      return { date: key, price, ruleName: match ? match.name : null };
    });

    const subtotal = perNight.reduce((sum, n) => sum + n.price, 0);
    return {
      nights: nightKeys.length,
      perNight,
      subtotal: Math.round(subtotal * 100) / 100,
      currency: roomType.currency,
    };
  },
};
