import { describe, expect, test } from "vitest";
import { publishHazardUpdate, waitForHazardUpdate } from "@/lib/hazard-events";

describe("hazard live-update events", () => {
    test("delivers a published update to a waiting long-poll request", async () => {
        const waitingForUpdate = waitForHazardUpdate({ timeoutMs: 1000 });

        publishHazardUpdate({ action: "created", hazardId: "hazard-1" });

        await expect(waitingForUpdate).resolves.toMatchObject({
            type: "hazards-updated",
            action: "created",
            hazardId: "hazard-1",
        });
    });

    test("returns a timeout event when nothing changes", async () => {
        await expect(waitForHazardUpdate({ timeoutMs: 1 })).resolves.toEqual({ type: "timeout" });
    });
});
