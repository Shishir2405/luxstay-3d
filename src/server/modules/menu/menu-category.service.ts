import 'server-only';
import { menuCategoryRepository } from './menu-category.repository';
import { MenuCategoryModel } from '@/server/models/menu-category.model';
import { ApiError } from '@/server/utils/api-error';
import { uniqueSlug } from '@/server/utils/slug';
import type { MenuCategoryCreateInput, MenuCategoryListQuery } from '@/lib/validators/menu';

export const menuCategoryService = {
  list(query: MenuCategoryListQuery) {
    return menuCategoryRepository.list(query);
  },

  async getById(id: string) {
    const doc = await menuCategoryRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu category not found');
    return doc;
  },

  async create(input: MenuCategoryCreateInput, actorId: string | null) {
    const slug = await uniqueSlug(input.name, (s) => menuCategoryRepository.slugExists(s));
    return menuCategoryRepository.create({ ...input, slug, createdBy: actorId });
  },

  async update(id: string, input: Partial<MenuCategoryCreateInput>, actorId: string | null) {
    const doc = await menuCategoryRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu category not found');
    const before = doc.toJSON();

    if (input.name && input.name !== doc.name) {
      doc.slug = await uniqueSlug(input.name, (s) =>
        MenuCategoryModel.exists({ slug: s, _id: { $ne: id }, isDeleted: false }).then(Boolean),
      );
    }
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await menuCategoryRepository.findById(id);
    if (!doc) throw ApiError.notFound('Menu category not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
