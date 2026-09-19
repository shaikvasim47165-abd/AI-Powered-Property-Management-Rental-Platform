const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongoServer: null };
}

const connectDB = async () => {
  // Return cached connection if already connected
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  const customUri = process.env.MONGODB_URI;

  // 1. If MONGODB_URI is provided (e.g. MongoDB Atlas on Vercel), connect to it
  if (customUri && customUri.trim() !== '') {
    if (!cached.promise) {
      cached.promise = mongoose
        .connect(customUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000,
        })
        .then((m) => {
          console.log(`[MongoDB] Connected to MongoDB Atlas / Custom URI: ${m.connection.host}`);
          return m;
        });
    }
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.warn(`[MongoDB] Failed to connect to MONGODB_URI (${err.message}). Falling back...`);
    }
  }

  // 2. Try local MongoDB instance (for local development)
  if (!process.env.VERCEL) {
    try {
      const localUri = 'mongodb://127.0.0.1:27017/property_management';
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[MongoDB] Connected to Local MongoDB: ${conn.connection.host}`);
      cached.conn = conn;
      return cached.conn;
    } catch (localErr) {
      console.log('[MongoDB] Local MongoDB server not detected. Starting in-memory engine...');
    }

    // 3. Fallback: in-memory Mongo server (local dev only)
    try {
      if (!cached.mongoServer) {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        cached.mongoServer = await MongoMemoryServer.create();
      }
      const memoryUri = cached.mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB: ${conn.connection.host}`);
      cached.conn = conn;
      return cached.conn;
    } catch (memErr) {
      console.error('[MongoDB] Error starting in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  } else {
    throw new Error('MONGODB_URI is required when running in production/Vercel serverless environment.');
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (cached.mongoServer) {
    await cached.mongoServer.stop();
  }
  cached.conn = null;
  cached.promise = null;
};

module.exports = { connectDB, disconnectDB };
