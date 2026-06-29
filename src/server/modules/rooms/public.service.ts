import 'server-only';
import { RoomTypeModel } from '@/server/models/room-type.model';
import { ApiError } from '@/server/utils/api-error';

/** Read-only helpers for the public storefront (no auth, active items only). */
export const publicRoomsService = {
  async getActiveBySlug(slug: string) {
    const doc = await RoomTypeModel.findOne({ slug, isActive: true, isDeleted: false })
      .populate('amenities')
      .lean();
    if (!doc) throw ApiError.notFound('Room not found');
    return doc;
  },

  featured(limit = 6) {
    return RoomTypeModel.find({ isActive: true, isDeleted: false })
      .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .populate('amenities')
      .lean();
  },
};
