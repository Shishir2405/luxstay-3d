import 'server-only';
import { contentBlockRepository } from './content-block.repository';
import { ApiError } from '@/server/utils/api-error';
import type { ContentBlockCreateInput, ContentBlockListQuery } from '@/lib/validators/content';

export const contentBlockService = {
  list(query: ContentBlockListQuery) {
    return contentBlockRepository.list(query);
  },

  async getById(id: string) {
    const doc = await contentBlockRepository.findById(id);
    if (!doc) throw ApiError.notFound('Content block not found');
    return doc;
  },

  async create(input: ContentBlockCreateInput, actorId: string | null) {
    if (await contentBlockRepository.keyExists(input.key, input.locale)) {
      throw ApiError.conflict('A content block with this key already exists for this locale');
    }
    return contentBlockRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Partial<ContentBlockCreateInput>, actorId: string | null) {
    const doc = await contentBlockRepository.findById(id);
    if (!doc) throw ApiError.notFound('Content block not found');
    const before = doc.toJSON();

    const nextKey = input.key ?? doc.key;
    const nextLocale = input.locale ?? doc.locale;
    if (
      (input.key !== undefined || input.locale !== undefined) &&
      (await contentBlockRepository.keyExistsExcluding(nextKey, nextLocale, id))
    ) {
      throw ApiError.conflict('A content block with this key already exists for this locale');
    }

    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await contentBlockRepository.findById(id);
    if (!doc) throw ApiError.notFound('Content block not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
