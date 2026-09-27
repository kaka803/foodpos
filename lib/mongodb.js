import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix querySrv ECONNREFUSED on Windows / ISP routers by routing SRV queries through Google & Cloudflare DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // ignore if not supported in current environment
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    process.env['MONGODB_URI ']?.trim() ||
    MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If already connected and ready, return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    } catch (e) {}

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30s
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // If the connection fails, clear the cached promise so next request can retry
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }

  return cached.conn;
}

export { connectToDatabase };
export default connectToDatabase;