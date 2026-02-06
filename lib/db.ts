import mongoose from 'mongoose';

const isVercelProd = process.env.VERCEL_ENV === 'production';
const MONGODB_URI = (isVercelProd ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI) ?? '';

if (!MONGODB_URI) {
    const missing = isVercelProd ? 'MONGODB_URI_PROD' : 'MONGODB_URI';
    throw new Error(`Please define the ${missing} environment variable.`);
}

if (isVercelProd && process.env.MONGODB_URI && process.env.MONGODB_URI_PROD && process.env.MONGODB_URI === process.env.MONGODB_URI_PROD) {
    throw new Error('MONGODB_URI and MONGODB_URI_PROD must point to different databases.');
}

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    var mongoose: MongooseCache | undefined;
}

const globalCache = globalThis as typeof globalThis & {
    mongoose?: MongooseCache;
};

const cached = globalCache.mongoose ?? (globalCache.mongoose = { conn: null, promise: null });

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
