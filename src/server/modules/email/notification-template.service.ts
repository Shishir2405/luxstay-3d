import 'server-only';
import { notificationTemplateRepository } from './notification-template.repository';
import { ApiError } from '@/server/utils/api-error';
import type {
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateListQuery,
} from '@/lib/validators/notifications';

export const notificationTemplateService = {
  list(query: TemplateListQuery) {
    return notificationTemplateRepository.list(query);
  },

  async getById(id: string) {
    const doc = await notificationTemplateRepository.findById(id);
    if (!doc) throw ApiError.notFound('Notification template not found');
    return doc;
  },

  async create(input: TemplateCreateInput, actorId: string | null) {
    if (await notificationTemplateRepository.keyExists(input.key)) {
      throw ApiError.conflict('A template with this key already exists');
    }
    return notificationTemplateRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: TemplateUpdateInput, actorId: string | null) {
    const doc = await notificationTemplateRepository.findById(id);
    if (!doc) throw ApiError.notFound('Notification template not found');
    const before = doc.toJSON();

    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await notificationTemplateRepository.findById(id);
    if (!doc) throw ApiError.notFound('Notification template not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
