import 'server-only';
import { SettingModel } from '@/server/models/setting.model';

export const settingsRepository = {
  get(namespace: string) {
    return SettingModel.findOne({ namespace, isDeleted: false }).lean();
  },

  upsert(namespace: string, values: Record<string, unknown>, description = '') {
    return SettingModel.findOneAndUpdate(
      { namespace },
      { $set: { values, description }, $setOnInsert: { namespace } },
      { upsert: true, new: true },
    ).lean();
  },

  list() {
    return SettingModel.find({ isDeleted: false }).lean();
  },
};
