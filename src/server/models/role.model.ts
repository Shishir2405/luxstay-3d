import 'server-only';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';
import { ROLES, type RoleName } from '@/lib/constants';

export interface RoleAttrs {
  key: RoleName;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

const roleSchema = createSchema<RoleAttrs & BaseFields>({
  key: { type: String, enum: Object.values(ROLES), required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  permissions: { type: [String], default: [] },
  isSystem: { type: Boolean, default: false },
});

export type RoleDoc = HydratedDocument<RoleAttrs & BaseFields>;

export const RoleModel = defineModel<RoleAttrs & BaseFields>('Role', roleSchema);
