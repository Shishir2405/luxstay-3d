import 'server-only';
import { amenityRepository } from './amenity.repository';
import { AmenityModel } from '@/server/models/amenity.model';
import { ApiError } from '@/server/utils/api-error';
import { uniqueSlug } from '@/server/utils/slug';
import type { PaginationQuery } from '@/lib/validators/common';
import type { AmenityCreateInput } from '@/lib/validators/rooms';

export const amenityService = {
  list(query: PaginationQuery) {
    return amenityRepository.list(query);
  },

  async getById(id: string) {
    const doc = await amenityRepository.findById(id);
    if (!doc) throw ApiError.notFound('Amenity not found');
    return doc;
  },

  async create(input: AmenityCreateInput, actorId: string | null) {
    const slug = await uniqueSlug(input.name, (s) => amenityRepository.slugExists(s));
    return amenityRepository.create({ ...input, slug, createdBy: actorId });
  },

  async update(id: string, input: Partial<AmenityCreateInput>, actorId: string | null) {
    const doc = await amenityRepository.findById(id);
    if (!doc) throw ApiError.notFound('Amenity not found');
    const before = doc.toJSON();

    if (input.name && input.name !== doc.name) {
      doc.slug = await uniqueSlug(input.name, (s) =>
        AmenityModel.exists({ slug: s, _id: { $ne: id }, isDeleted: false }).then(Boolean),
      );
    }
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await amenityRepository.findById(id);
    if (!doc) throw ApiError.notFound('Amenity not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
