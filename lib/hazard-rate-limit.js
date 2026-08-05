import { connectToDatabase } from "@/lib/mongodb";
import { RateLimit } from "@/lib/models/rate-limit";

const MAX_SUBMISSIONS_PER_HOUR = 3;
const HOUR_MS = 60 * 60 * 1000;

export function getRequestIp(request) {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || "local";
}

export async function checkHazardSubmissionRateLimit(ip, now = Date.now()) {
    await connectToDatabase();
    const window = Math.floor(now / HOUR_MS);
    const expiresAt = new Date((window + 1) * HOUR_MS);
    const key = `hazard-submit:${ip}:${window}`;
    const entry = await RateLimit.findOneAndUpdate({ key }, {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
    }, { new: true, upsert: true }).lean();

    return {
        allowed: entry.count <= MAX_SUBMISSIONS_PER_HOUR,
        remaining: Math.max(0, MAX_SUBMISSIONS_PER_HOUR - entry.count),
        retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
    };
}
