import 'server-only';
import type { FilterQuery } from 'mongoose';
import { eventRepository } from './event.repository';
import { EventModel, type EventAttrs } from '@/server/models/event.model';
import type { BaseFields } from '@/server/models/base';
import { ApiError } from '@/server/utils/api-error';
import { uniqueSlug } from '@/server/utils/slug';
import type {
  EventCloneInput,
  EventCreateInput,
  EventListQuery,
  EventScheduleCreateInput,
  EventUpdateInput,
} from '@/lib/validators/events';

export const eventService = {
  list(query: EventListQuery, options: { publicOnly?: boolean } = {}) {
    const filter: FilterQuery<EventAttrs & BaseFields> = {};
    if (options.publicOnly) filter.isPublished = true;
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.isPublished) filter.isPublished = query.isPublished === 'true';
    if (query.isFeatured) filter.isFeatured = query.isFeatured === 'true';
    return eventRepository.list(query, filter);
  },

  async getById(id: string) {
    const doc = await eventRepository.findById(id);
    if (!doc) throw ApiError.notFound('Event not found');
    return doc;
  },

  async create(input: EventCreateInput, actorId: string | null) {
    const slug = await uniqueSlug(input.title, (s) => eventRepository.slugExists(s));
    return eventRepository.create({ ...input, slug, rsvpCount: 0, createdBy: actorId });
  },

  async update(id: string, input: EventUpdateInput, actorId: string | null) {
    const doc = await eventRepository.findById(id);
    if (!doc) throw ApiError.notFound('Event not found');
    const before = doc.toJSON();

    if (input.title && input.title !== doc.title) {
      doc.slug = await uniqueSlug(input.title, (s) =>
        EventModel.exists({ slug: s, _id: { $ne: id }, isDeleted: false }).then(Boolean),
      );
    }
    Object.assign(doc, input);
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before, after: doc.toJSON() };
  },

  async remove(id: string, actorId: string | null) {
    const doc = await eventRepository.findById(id);
    if (!doc) throw ApiError.notFound('Event not found');
    const before = doc.toJSON();
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.updatedBy = actorId as never;
    await doc.save();
    return { before };
  },

  /**
   * Clone a recurring event template into a new dated instance. Copies content
   * (tiers, lineup, media) but resets RSVP count and dates, producing an
   * independent event the team can publish per occurrence.
   */
  async cloneFromTemplate(id: string, input: EventCloneInput, actorId: string | null) {
    const template = await eventRepository.findById(id);
    if (!template) throw ApiError.notFound('Event not found');

    const source = template.toObject();
    const title = input.title ?? source.title;
    const slug = await uniqueSlug(title, (s) => eventRepository.slugExists(s));

    return eventRepository.create({
      title,
      slug,
      description: source.description,
      type: source.type,
      bannerUrl: source.bannerUrl,
      media: source.media,
      startAt: input.startAt,
      endAt: input.endAt,
      venue: source.venue,
      capacity: source.capacity,
      rsvpCount: 0,
      tiers: source.tiers,
      isRecurring: false,
      recurrenceRule: source.recurrenceRule,
      djLineup: source.djLineup,
      status: 'scheduled',
      isPublished: false,
      isFeatured: false,
      createdBy: actorId,
    });
  },

  async capacityStatus(id: string) {
    const doc = await eventRepository.findById(id);
    if (!doc) throw ApiError.notFound('Event not found');
    const remaining = Math.max(doc.capacity - doc.rsvpCount, 0);
    return { capacity: doc.capacity, rsvpCount: doc.rsvpCount, remaining };
  },

  async listSchedule(eventId: string) {
    const doc = await eventRepository.findById(eventId);
    if (!doc) throw ApiError.notFound('Event not found');
    return eventRepository.listSchedule(eventId);
  },

  async addScheduleEntry(eventId: string, input: EventScheduleCreateInput, actorId: string | null) {
    const doc = await eventRepository.findById(eventId);
    if (!doc) throw ApiError.notFound('Event not found');
    return eventRepository.createSchedule({ ...input, event: eventId, createdBy: actorId });
  },
};
