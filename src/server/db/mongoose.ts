import 'server-only';
import mongoose from 'mongoose';
import { env } from '@/server/config/env';
import { logger } from '@/server/utils/logger';

/**
 * Cached Mongoose connection.
 *
 * Next.js route handlers run in a long-lived Node process but hot-reload modules
 * in dev, which would otherwise open a new connection on every change. We stash
 * the connection promise on `globalThis` so it survives reloads.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache };

const cache: MongooseCache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cache;

mongoose.set('strictQuery', true);

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongoUri, {
        dbName: env.mongoDbName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        logger.info('mongo', `connected to ${env.mongoDbName}`);
        return m;
      })
      .catch((err) => {
        cache.promise = null; // allow retry on next request
        logger.error('mongo', 'connection failed', err);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
