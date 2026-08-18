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

function rateLimitResult(count, limit, expiresAt, now, inclusive = false) {
    return {
        allowed: inclusive ? count <= limit : count < limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    };
}

function hazardSubmissionWindow(now) {
    const window = Math.floor(now / HOUR_MS);
    return {
        key: `hazard-submit:${window}`,
        expiresAt: new Date((window + 1) * HOUR_MS),
    };
}

/** Read the allowance without treating a button click as a submitted report. */
export async function getHazardSubmissionRateLimit(userId, now = Date.now()) {
    const { key: windowKey, expiresAt } = hazardSubmissionWindow(now);
    const redis = getRedis();
    if (redis) {
        try {
            if (redis.status === "wait")
                await redis.connect();
            const count = Number(await redis.get(`rate-limit:${windowKey}:${userId}`)) || 0;
            return rateLimitResult(count, MAX_SUBMISSIONS_PER_HOUR, expiresAt, now);
        }
        catch (error) {
            console.warn("Redis rate-limit lookup failed; using MongoDB fallback.", error.message);
        }
    }
    await connectToDatabase();
    const entry = await RateLimit.findOne({ key: `${windowKey}:${userId}` }).lean();
    return rateLimitResult(entry?.count ?? 0, MAX_SUBMISSIONS_PER_HOUR, expiresAt, now);
}

/** Record only a report that was successfully written to MongoDB. */
export async function recordHazardSubmission(userId, now = Date.now()) {
    const { key: windowKey, expiresAt } = hazardSubmissionWindow(now);
    const redis = getRedis();
    if (redis) {
        try {
            if (redis.status === "wait")
                await redis.connect();
            const key = `rate-limit:${windowKey}:${userId}`;
            const count = await redis.incr(key);
            if (count === 1)
                await redis.pexpire(key, Math.max(1, expiresAt.getTime() - now));
            return rateLimitResult(count, MAX_SUBMISSIONS_PER_HOUR, expiresAt, now, true);
        }
        catch (error) {
            console.warn("Redis rate-limit recording failed; using MongoDB fallback.", error.message);
        }
    }
    await connectToDatabase();
    const entry = await RateLimit.findOneAndUpdate({ key: `${windowKey}:${userId}` }, {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
    }, { new: true, upsert: true }).lean();
    return rateLimitResult(entry.count, MAX_SUBMISSIONS_PER_HOUR, expiresAt, now, true);
}

/** Undo a concurrent over-limit increment after its newly-created hazard was removed. */
export async function releaseHazardSubmission(userId, now = Date.now()) {
    const { key: windowKey } = hazardSubmissionWindow(now);
    const redis = getRedis();
    const key = `rate-limit:${windowKey}:${userId}`;
    if (redis) {
        try {
            if (redis.status === "wait")
                await redis.connect();
            const count = await redis.decr(key);
            if (count <= 0)
                await redis.del(key);
            return;
        }
        catch (error) {
            console.warn("Redis rate-limit release failed; using MongoDB fallback.", error.message);
        }
    }
    await connectToDatabase();
    await RateLimit.updateOne({ key: `${windowKey}:${userId}`, count: { $gt: 0 } }, { $inc: { count: -1 } });
}

// Used by sign-in, password reset, voting, and other actions that should be
// counted when the request is made rather than after an item is saved.
export async function checkRateLimit({ namespace, identifier, limit, windowMs, now = Date.now() }) {
    const window = Math.floor(now / windowMs);
    const expiresAt = new Date((window + 1) * windowMs);
    const redis = getRedis();
    if (redis) {
        try {
            if (redis.status === "wait")
                await redis.connect();
            const key = `rate-limit:${namespace}:${identifier}:${window}`;
            const count = await redis.incr(key);
            if (count === 1)
                await redis.pexpire(key, Math.max(1, expiresAt.getTime() - now));
            return rateLimitResult(count, limit, expiresAt, now, true);
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
    return rateLimitResult(entry.count, limit, expiresAt, now, true);
}
