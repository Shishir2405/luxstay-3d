import 'server-only';
import { reviewRepository } from './review.repository';
import { ApiError } from '@/server/utils/api-error';
import { REVIEW_STATUS, type ReviewStatus } from '@/lib/constants';
import type { ReviewCreateInput, ReviewListQuery } from '@/lib/validators/customer';
import type { PaginationQuery } from '@/lib/validators/common';

export const reviewService = {
  list(query: ReviewListQuery) {
    return reviewRepository.list(query);
  },

  listPublic(roomTypeId: string, query: PaginationQuery) {
    return reviewRepository.listPublic(roomTypeId, query);
  },

  async getById(id: string) {
    const doc = await reviewRepository.findById(id);
    if (!doc) throw ApiError.notFound('Review not found');
    return doc;
  },

  /** Guest-submitted reviews always start as Pending and hidden until moderated. */
  create(input: ReviewCreateInput, actor: { id: string; name: string }) {
    return reviewRepository.create({
      ...input,
      user: actor.id,
      authorName: actor.name,
      status: REVIEW_STATUS.PENDING,
      isPublic: false,
      createdBy: actor.id,
    });
  },

  async moderate(
    id: string,
    input: { status: ReviewStatus; isPublic?: boolean },
    actorId: string | null,
  ) {
    const doc = await reviewRepository.findById(id);
    if (!doc) throw ApiError.notFound('Review not found');
    const before = doc.toJSON();

    doc.status = input.status;
    // Approving publishes by default; rejecting hides. Explicit flag overrides.
    doc.isPublic = input.isPublic ?? input.status === REVIEW_STATUS.APPROVED;
    doc.updatedBy = actorId as never;
    await doc.save();

    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await reviewRepository.findById(id);
    if (!doc) throw ApiError.notFound('Review not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },
};
