import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    expireStaleHazards: vi.fn(),
}));

import { expireStaleHazards } from "@/lib/hazard-store";
import { GET } from "@/app/api/cron/expire-hazards/route";

describe("/api/cron/expire-hazards", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.CRON_SECRET = "test-secret";
    });

    test("expires stale reports only when called with the configured secret", async () => {
        expireStaleHazards.mockResolvedValue(3);
        const response = await GET(new Request("http://localhost/api/cron/expire-hazards", {
            headers: { authorization: "Bearer test-secret" },
        }));

        expect(response.status).toBe(200);
        expect(expireStaleHazards).toHaveBeenCalledOnce();
        await expect(response.json()).resolves.toEqual({ expiredCount: 3 });
    });

    test("rejects callers without the secret", async () => {
        const response = await GET(new Request("http://localhost/api/cron/expire-hazards"));

        expect(response.status).toBe(401);
        expect(expireStaleHazards).not.toHaveBeenCalled();
    });
});
