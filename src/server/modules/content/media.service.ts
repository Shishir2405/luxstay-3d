import 'server-only';
import { mediaRepository } from './media.repository';
import { ApiError } from '@/server/utils/api-error';
import type { MediaCreateInput, MediaListQuery } from '@/lib/validators/content';

export const mediaService = {
  list(query: MediaListQuery) {
    return mediaRepository.list(query);
  },

  async getById(id: string) {
    const doc = await mediaRepository.findById(id);
    if (!doc) throw ApiError.notFound('Media asset not found');
    return doc;
  },

  create(input: MediaCreateInput, actorId: string | null) {
    return mediaRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Partial<MediaCreateInput>, actorId: string | null) {
    const doc = await mediaRepository.findById(id);
    if (!doc) throw ApiError.notFound('Media asset not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await mediaRepository.findById(id);
    if (!doc) throw ApiError.notFound('Media asset not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
