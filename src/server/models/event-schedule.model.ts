import 'server-only';
import { Schema } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface EventScheduleAttrs {
  event: Schema.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  performer: string;
  note: string;
}

const eventScheduleSchema = createSchema<EventScheduleAttrs & BaseFields>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  startAt: { type: Date, required: true, index: true },
  endAt: { type: Date, required: true },
  performer: { type: String, default: '' },
  note: { type: String, default: '' },
});

export type EventScheduleDoc = HydratedDocument<EventScheduleAttrs & BaseFields>;
export const EventScheduleModel = defineModel<EventScheduleAttrs & BaseFields>(
  'EventSchedule',
  eventScheduleSchema,
);
