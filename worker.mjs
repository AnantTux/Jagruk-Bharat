import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const appUrl = process.env.APP_INTERNAL_URL
    ?? (process.env.APP_INTERNAL_HOSTPORT ? `http://${process.env.APP_INTERNAL_HOSTPORT}` : "http://127.0.0.1:3000");
const cronSecret = process.env.CRON_SECRET;
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const queue = new Queue("hazard-maintenance", { connection });

const worker = new Worker("hazard-maintenance", async (job) => {
    if (job.name !== "expire-hazards")
        return;
    if (!cronSecret) {
        console.warn("CRON_SECRET is missing; skipping hazard expiry job.");
        return;
    }
    const response = await fetch(`${appUrl}/api/cron/expire-hazards`, {
        headers: { authorization: `Bearer ${cronSecret}` },
    });
    if (!response.ok)
        throw new Error(`Hazard expiry endpoint returned ${response.status}`);
    const result = await response.json();
    console.log(`Hazard expiry completed; ${result.expiredCount} reports expired.`);
}, { connection });

worker.on("failed", (job, error) => {
    console.error(`Background job ${job?.name ?? "unknown"} failed:`, error.message);
});

async function scheduleExpirySweep() {
    await queue.add("expire-hazards", {}, {
        removeOnComplete: 100,
        removeOnFail: 250,
    });
}

await scheduleExpirySweep();
const timer = setInterval(() => {
    void scheduleExpirySweep().catch((error) => console.error("Could not schedule expiry job:", error.message));
}, 60_000);

async function shutdown() {
    clearInterval(timer);
    await worker.close();
    await queue.close();
    await connection.quit();
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Hazard maintenance worker is running.");
