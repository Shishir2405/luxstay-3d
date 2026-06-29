import 'server-only';
import { bannerRepository } from './banner.repository';
import { ApiError } from '@/server/utils/api-error';
import type {
  BannerCreateInput,
  BannerUpdateInput,
  BannerListQuery,
} from '@/lib/validators/content';

export const bannerService = {
  list(query: BannerListQuery) {
    return bannerRepository.list(query);
  },

  activeBanners(placement: string) {
    return bannerRepository.activeBanners(placement);
  },

  async getById(id: string) {
    const doc = await bannerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Banner not found');
    return doc;
  },

  create(input: BannerCreateInput, actorId: string | null) {
    return bannerRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: BannerUpdateInput, actorId: string | null) {
    const doc = await bannerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Banner not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await bannerRepository.findById(id);
    if (!doc) throw ApiError.notFound('Banner not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
