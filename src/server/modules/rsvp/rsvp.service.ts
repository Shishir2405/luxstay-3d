import 'server-only';
import crypto from 'node:crypto';
import { rsvpRepository } from './rsvp.repository';
import { ApiError } from '@/server/utils/api-error';
import { generateRefCode } from '@/server/utils/ref-code';
import { RSVP_STATUS } from '@/lib/constants/enums';
import type { RsvpCreateInput, RsvpUpdateInput, RsvpListQuery } from '@/lib/validators/rsvp';

export const rsvpService = {
  list(query: RsvpListQuery) {
    return rsvpRepository.list(query);
  },

  async getById(id: string) {
    const doc = await rsvpRepository.findById(id);
    if (!doc) throw ApiError.notFound('RSVP not found');
    return doc;
  },

  /**
   * Creates an RSVP. When an event + capacity are provided, the RSVP is
   * Waitlisted if confirmed RSVPs already meet capacity, otherwise Confirmed.
   * With no event, status falls back to Confirmed.
   */
  async create(input: RsvpCreateInput, actorId: string | null, eventCapacity?: number) {
    const code = generateRefCode('RV');
    const qrToken = crypto.randomBytes(16).toString('hex');

    let status: string = RSVP_STATUS.CONFIRMED;
    if (input.event && typeof eventCapacity === 'number' && eventCapacity > 0) {
      const confirmed = await rsvpRepository.countConfirmed(input.event);
      status =
        confirmed + input.guestCount > eventCapacity
          ? RSVP_STATUS.WAITLISTED
          : RSVP_STATUS.CONFIRMED;
    }

    return rsvpRepository.create({
      event: input.event,
      eventName: input.eventName,
      code,
      contact: input.contact,
      guestCount: input.guestCount,
      tier: input.tier,
      specialRequests: input.specialRequests,
      status,
      qrToken,
      tableReservation: null,
      user: actorId,
      checkedInAt: null,
      createdBy: actorId,
    });
  },

  async update(id: string, input: RsvpUpdateInput, actorId: string | null) {
    const doc = await rsvpRepository.findById(id);
    if (!doc) throw ApiError.notFound('RSVP not found');
    const before = doc.toJSON();
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await rsvpRepository.findById(id);
    if (!doc) throw ApiError.notFound('RSVP not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },

  /** Marks an RSVP checked-in, stamps the time, and writes a GuestCheckin record. */
  async checkIn(
    id: string,
    actorName: string,
    actorId: string | null,
    method: 'qr' | 'manual' | 'code' = 'manual',
  ) {
    const doc = await rsvpRepository.findById(id);
    if (!doc) throw ApiError.notFound('RSVP not found');
    if (doc.status === RSVP_STATUS.CHECKED_IN) {
      throw ApiError.conflict('RSVP is already checked in');
    }
    const before = doc.toJSON();
    const now = new Date();
    doc.status = RSVP_STATUS.CHECKED_IN;
    doc.checkedInAt = now;
    doc.updatedBy = actorId as never;
    await doc.save();

    await rsvpRepository.createCheckin({
      rsvp: doc._id,
      event: doc.event,
      checkedInBy: actorName,
      at: now,
      method,
      createdBy: actorId,
    });

    return { before, after: doc.toJSON() };
  },
};
