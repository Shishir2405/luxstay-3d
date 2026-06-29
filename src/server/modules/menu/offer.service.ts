import 'server-only';
import { offerRepository } from './offer.repository';
import { ApiError } from '@/server/utils/api-error';
import type { OfferCreateInput, OfferListQuery } from '@/lib/validators/menu';

export const offerService = {
  list(query: OfferListQuery) {
    return offerRepository.list(query);
  },

  async getById(id: string) {
    const doc = await offerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Offer not found');
    return doc;
  },

  async create(input: OfferCreateInput, actorId: string | null) {
    return offerRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Partial<OfferCreateInput>, actorId: string | null) {
    const doc = await offerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Offer not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await offerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Offer not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
