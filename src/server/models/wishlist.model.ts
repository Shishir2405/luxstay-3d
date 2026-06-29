import 'server-only';
import { Schema, type Types } from 'mongoose';
import { createSchema, defineModel, type BaseFields, type HydratedDocument } from './base';

export interface WishlistAttrs {
  user: Types.ObjectId;
  roomType: Types.ObjectId;
}

const wishlistSchema = createSchema<WishlistAttrs & BaseFields>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
});

// A guest can wishlist a given room type only once.
wishlistSchema.index({ user: 1, roomType: 1 }, { unique: true });

export type WishlistDoc = HydratedDocument<WishlistAttrs & BaseFields>;
export const WishlistModel = defineModel<WishlistAttrs & BaseFields>('Wishlist', wishlistSchema);
