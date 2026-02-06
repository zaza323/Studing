import mongoose from 'mongoose';

const getMongoUri = () => {
    const uri = process.env.MONGODB_URI ?? '';

    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable.');
    }

    return uri;
};

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

        const uri = getMongoUri();
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
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
