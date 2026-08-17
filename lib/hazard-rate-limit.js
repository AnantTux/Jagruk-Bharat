import { connectToDatabase } from "@/lib/mongodb";
import { RateLimit } from "@/lib/models/rate-limit";
import { getRedis } from "@/lib/redis";

const MAX_SUBMISSIONS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

export function getRequestIp(request) {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "local";
}

export async function checkHazardSubmissionRateLimit(ip, now = Date.now()) {
    return checkRateLimit({ namespace: "hazard-submit", identifier: ip, limit: MAX_SUBMISSIONS_PER_HOUR, windowMs: HOUR_MS, now });
}

export async function checkRateLimit({ namespace, identifier, limit, windowMs, now = Date.now() }) {
    const window = Math.floor(now / windowMs);
    const expiresAt = new Date((window + 1) * windowMs);
    const redis = getRedis();

    // Docker and production deployments with REDIS_URL use atomic Redis increments.
    // MongoDB below remains the durable fallback for a local app without Redis.
    if (redis) {
        try {
            if (redis.status === "wait")
                await redis.connect();
            const key = `rate-limit:${namespace}:${identifier}:${window}`;
            const count = await redis.incr(key);
            if (count === 1)
                await redis.pexpire(key, Math.max(1, expiresAt.getTime() - now));
            return {
                allowed: count <= limit,
                remaining: Math.max(0, limit - count),
                retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
            };
        }
        catch (error) {
            console.warn("Redis rate limiting failed; using MongoDB fallback.", error.message);
        }
    }

    await connectToDatabase();
    const key = `${namespace}:${identifier}:${window}`;
    const entry = await RateLimit.findOneAndUpdate({ key }, {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
    }, { new: true, upsert: true }).lean();

    return {
        allowed: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    };
}
