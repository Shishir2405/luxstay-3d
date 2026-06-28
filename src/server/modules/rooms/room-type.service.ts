import 'server-only';
import { roomTypeRepository, type RoomTypeListFilter } from './room-type.repository';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { ApiError } from '@/server/utils/api-error';
import { uniqueSlug } from '@/server/utils/slug';
import type { RoomTypeCreateInput } from '@/lib/validators/rooms';

export const roomTypeService = {
  list(filter: RoomTypeListFilter) {
    return roomTypeRepository.list(filter);
  },

  async getById(id: string) {
    const doc = await roomTypeRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room type not found');
    return doc;
  },

  async create(input: RoomTypeCreateInput, actorId: string | null) {
    const slug = await uniqueSlug(input.name, (s) => roomTypeRepository.slugExists(s));
    return roomTypeRepository.create({ ...input, slug, createdBy: actorId });
  },

  async update(id: string, input: Partial<RoomTypeCreateInput>, actorId: string | null) {
    const doc = await roomTypeRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room type not found');
    const before = doc.toJSON();

    if (input.name && input.name !== doc.name) {
      doc.slug = await uniqueSlug(input.name, (s) => roomTypeRepository.slugExists(s, id));
    }
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await roomTypeRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room type not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },

  /** Duplicates a room type as an inactive template (units are NOT copied). */
  async clone(id: string, actorId: string | null) {
    const source = await RoomTypeModel.findOne({ _id: id, isDeleted: false }).lean();
    if (!source) throw ApiError.notFound('Room type not found');

    const name = `${source.name} (Copy)`;
    const slug = await uniqueSlug(name, (s) => roomTypeRepository.slugExists(s));
    const { _id, createdAt, updatedAt, ...rest } = source as Record<string, unknown>;
    void _id;
    void createdAt;
    void updatedAt;

    return roomTypeRepository.create({
      ...rest,
      name,
      slug,
      isActive: false,
      isFeatured: false,
      createdBy: actorId,
    });
  },

  exportAll() {
    return roomTypeRepository.findAllForExport();
  },
};
