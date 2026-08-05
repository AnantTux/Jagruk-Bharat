import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-events", () => ({
    waitForHazardUpdate: vi.fn(),
}));

import { waitForHazardUpdate } from "@/lib/hazard-events";
import { GET } from "@/app/api/hazards/stream/route";

describe("/api/hazards/stream", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("waits for an update and prevents cached responses", async () => {
        waitForHazardUpdate.mockResolvedValue({ type: "hazards-updated", action: "created" });
        const request = new Request("http://localhost/api/hazards/stream?timeout=99999");

        const response = await GET(request);

        expect(waitForHazardUpdate).toHaveBeenCalledWith(expect.objectContaining({ timeoutMs: 25000 }));
        expect(response.headers.get("cache-control")).toContain("no-store");
        await expect(response.json()).resolves.toEqual({
            event: { type: "hazards-updated", action: "created" },
        });
    });
});
