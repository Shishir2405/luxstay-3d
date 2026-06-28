import 'server-only';
import { RoomUnitModel, type RoomUnitAttrs } from '@/server/models/room-unit.model';
import { paginate } from '@/server/utils/paginate';
import type { BaseFields } from '@/server/models/base';
import type { FilterQuery } from 'mongoose';
import type { RoomUnitStatus } from '@/lib/constants';

type UnitFilter = FilterQuery<RoomUnitAttrs & BaseFields>;

export interface RoomUnitListFilter {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  roomType?: string;
  status?: RoomUnitStatus;
}

export const roomUnitRepository = {
  list(filter: RoomUnitListFilter) {
    const mongoFilter: UnitFilter = {};
    if (filter.roomType)
      mongoFilter.roomType = filter.roomType as unknown as UnitFilter['roomType'];
    if (filter.status) mongoFilter.status = filter.status;
    return paginate(RoomUnitModel, {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      searchFields: ['unitNumber', 'notes'],
      sortBy: filter.sortBy,
      sortDir: filter.sortDir,
      filter: mongoFilter,
      defaultSort: { unitNumber: 1 },
      populate: 'roomType',
    });
  },

  findById(id: string) {
    return RoomUnitModel.findOne({ _id: id, isDeleted: false });
  },

  create(data: Record<string, unknown>) {
    return RoomUnitModel.create(data as Partial<RoomUnitAttrs>);
  },

  countByStatusForType(roomTypeId: string) {
    return RoomUnitModel.aggregate<{ _id: RoomUnitStatus; count: number }>([
      { $match: { roomType: { $eq: roomTypeId }, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  },
};
