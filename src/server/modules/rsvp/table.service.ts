import 'server-only';
import { tableRepository } from './table.repository';
import { ApiError } from '@/server/utils/api-error';
import type { TableCreateInput, TableUpdateInput, TableListQuery } from '@/lib/validators/rsvp';

export const tableService = {
  list(query: TableListQuery) {
    return tableRepository.list(query);
  },

  async getById(id: string) {
    const doc = await tableRepository.findById(id);
    if (!doc) throw ApiError.notFound('Table not found');
    return doc;
  },

  create(input: TableCreateInput, actorId: string | null) {
    return tableRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: TableUpdateInput, actorId: string | null) {
    const doc = await tableRepository.findById(id);
    if (!doc) throw ApiError.notFound('Table not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await tableRepository.findById(id);
    if (!doc) throw ApiError.notFound('Table not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
