import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";

const globalForQueues = globalThis;

export function getHazardQueue() {
    const connection = getRedis();
    if (!connection)
        return null;
    if (!globalForQueues.__jagrukBharatHazardQueue) {
        globalForQueues.__jagrukBharatHazardQueue = new Queue("hazard-maintenance", {
            connection,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 250,
            },
        });
    }
    return globalForQueues.__jagrukBharatHazardQueue;
}

export async function queueHazardExpirySweep() {
    const queue = getHazardQueue();
    if (!queue)
        return false;
    await queue.add("expire-hazards", {});
    return true;
}
