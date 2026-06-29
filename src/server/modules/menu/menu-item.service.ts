import 'server-only';
import { menuItemRepository } from './menu-item.repository';
import { menuCategoryRepository } from './menu-category.repository';
import { ApiError } from '@/server/utils/api-error';
import type { MenuItemCreateInput, MenuItemListQuery } from '@/lib/validators/menu';

export const menuItemService = {
  list(query: MenuItemListQuery) {
    return menuItemRepository.list(query);
  },

  async getById(id: string) {
    const doc = await menuItemRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu item not found');
    return doc;
  },

  async create(input: MenuItemCreateInput, actorId: string | null) {
    const category = await menuCategoryRepository.findById(input.category);
    if (!category) throw ApiError.badRequest('Menu category not found');
    return menuItemRepository.create({ ...input, createdBy: actorId });
  },

  async update(id: string, input: Partial<MenuItemCreateInput>, actorId: string | null) {
    const doc = await menuItemRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu item not found');
    if (input.category) {
      const category = await menuCategoryRepository.findById(input.category);
      if (!category) throw ApiError.badRequest('Menu category not found');
    }
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async setAvailability(id: string, isAvailable: boolean, actorId: string | null) {
    const doc = await menuItemRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu item not found');
    const before = doc.toJSON();
    doc.isAvailable = isAvailable;
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await menuItemRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu item not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
