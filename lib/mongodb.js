import mongoose from "mongoose";
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local before starting the app.");
}
const globalMongo = globalThis;
const cache = (globalMongo.__mongoCache ?? (globalMongo.__mongoCache = { connection: null, promise: null }));
export async function connectToDatabase() {
    if (cache.connection)
        return cache.connection;
    cache.promise ?? (cache.promise = mongoose.connect(uri, {
        // Fail within the serverless request budget with a useful server log,
        // rather than keeping a browser request open indefinitely.
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
    }));
    cache.connection = await cache.promise;
    return cache.connection;
}
