// ═══════════════════════════════════════════════════════════
// MongoDB Connection — Mongoose singleton for Next.js
// ═══════════════════════════════════════════════════════════

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-organizer";

// Cached connection for Next.js hot-reloads
const globalWithMongoose = global as typeof globalThis & {
  _mongooseConn: typeof mongoose | null;
  _mongoosePromise: Promise<typeof mongoose> | null;
};

if (!globalWithMongoose._mongooseConn) globalWithMongoose._mongooseConn = null;
if (!globalWithMongoose._mongoosePromise) globalWithMongoose._mongoosePromise = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/tournament-organizer";

  if (globalWithMongoose._mongooseConn && mongoose.connection.readyState === 1) {
    return globalWithMongoose._mongooseConn;
  }

  if (!globalWithMongoose._mongoosePromise) {
    globalWithMongoose._mongoosePromise = mongoose.connect(uri, {
      bufferCommands: false,
    }).catch((err) => {
      globalWithMongoose._mongoosePromise = null;
      throw err;
    });
  }

  try {
    globalWithMongoose._mongooseConn = await globalWithMongoose._mongoosePromise;
    return globalWithMongoose._mongooseConn;
  } catch (err) {
    globalWithMongoose._mongoosePromise = null;
    throw err;
  }
}
