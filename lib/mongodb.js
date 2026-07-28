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
    cache.promise ?? (cache.promise = mongoose.connect(uri));
    cache.connection = await cache.promise;
    return cache.connection;
}
