import Redis from "ioredis";

const globalForRedis = globalThis;

function redisUrl() {
    return process.env.REDIS_URL;
}

// Redis is optional outside Docker. Every caller has a MongoDB/direct fallback,
// so a missing or temporarily unavailable cache never takes the map offline.
export function getRedis() {
    if (!redisUrl())
        return null;

    if (!globalForRedis.__jagrukBharatRedis) {
        const client = new Redis(redisUrl(), {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            lazyConnect: true,
        });
        client.on("error", (error) => {
            // Do not throw from an event handler: Redis is an optimisation, not a dependency.
            console.warn("Redis unavailable; using the database fallback.", error.message);
        });
        globalForRedis.__jagrukBharatRedis = client;
    }

    return globalForRedis.__jagrukBharatRedis;
}

async function ensureConnected(redis) {
    if (redis.status === "wait")
        await redis.connect();
}

export async function getCachedJson(key) {
    const redis = getRedis();
    if (!redis)
        return null;
    try {
        await ensureConnected(redis);
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch {
        return null;
    }
}

export async function setCachedJson(key, value, ttlSeconds) {
    const redis = getRedis();
    if (!redis)
        return;
    try {
        await ensureConnected(redis);
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
    catch {
        // Cache writes must never fail a reporting request.
    }
}

export async function deleteCached(key) {
    const redis = getRedis();
    if (!redis)
        return;
    try {
        await ensureConnected(redis);
        await redis.del(key);
    }
    catch {
        // Ignore unavailable cache; the source of truth is MongoDB.
    }
}
