import 'server-only';
import { roomUnitRepository, type RoomUnitListFilter } from './room-unit.repository';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { ApiError } from '@/server/utils/api-error';
import type { RoomUnitStatus } from '@/lib/constants';

interface CreateUnitInput {
  roomType: string;
  unitNumber: string;
  floor: number;
  status: RoomUnitStatus;
  notes: string;
}

export const roomUnitService = {
  list(filter: RoomUnitListFilter) {
    return roomUnitRepository.list(filter);
  },

  async getById(id: string) {
    const doc = await roomUnitRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room unit not found');
    return doc;
  },

  async create(input: CreateUnitInput, actorName: string, actorId: string | null) {
    const typeExists = await RoomTypeModel.exists({ _id: input.roomType, isDeleted: false });
    if (!typeExists) throw ApiError.badRequest('The selected room type does not exist');

    try {
      return await roomUnitRepository.create({
        ...input,
        statusHistory: [
          { status: input.status, reason: 'Created', at: new Date(), byName: actorName },
        ],
        createdBy: actorId,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw ApiError.conflict(`Unit ${input.unitNumber} already exists for this room type`);
      }
      throw err;
    }
  },

  async update(id: string, input: Partial<CreateUnitInput>, actorId: string | null) {
    const doc = await roomUnitRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room unit not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  /** Transitions a unit's status and appends to its immutable status history. */
  async changeStatus(
    id: string,
    status: RoomUnitStatus,
    reason: string,
    actorName: string,
    actorId: string | null,
  ) {
    const doc = await roomUnitRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room unit not found');
    const before = doc.toJSON();
    if (doc.status !== status) {
      doc.status = status;
      doc.statusHistory.push({ status, reason, at: new Date(), byName: actorName });
      doc.updatedBy = actorId as never;
      await doc.save();
    }
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await roomUnitRepository.findById(id);
    if (!doc) throw ApiError.notFound('Room unit not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
