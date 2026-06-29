import 'server-only';
import { seoRepository } from './seo.repository';
import { ApiError } from '@/server/utils/api-error';
import type { SeoCreateInput, SeoListQuery } from '@/lib/validators/content';

export const seoService = {
  list(query: SeoListQuery) {
    return seoRepository.list(query);
  },

  async getById(id: string) {
    const doc = await seoRepository.findById(id);
    if (!doc) throw ApiError.notFound('SEO metadata not found');
    return doc;
  },

  async create(input: SeoCreateInput, actorId: string | null) {
    if (await seoRepository.pathExists(input.path)) {
      throw ApiError.conflict('SEO metadata for this path already exists');
    }
    return seoRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Partial<SeoCreateInput>, actorId: string | null) {
    const doc = await seoRepository.findById(id);
    if (!doc) throw ApiError.notFound('SEO metadata not found');
    const before = doc.toJSON();

    if (input.path && input.path !== doc.path) {
      if (await seoRepository.pathExistsExcluding(input.path, id)) {
        throw ApiError.conflict('SEO metadata for this path already exists');
      }
    }

    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await seoRepository.findById(id);
    if (!doc) throw ApiError.notFound('SEO metadata not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
