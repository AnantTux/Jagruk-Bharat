import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    voteHazard: vi.fn(),
}));

import { voteHazard } from "@/lib/hazard-store";
import { POST } from "@/app/api/hazards/[id]/vote/route";

function requestWith(body) {
    return new Request("http://localhost/api/hazards/hazard-1/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const context = { params: Promise.resolve({ id: "hazard-1" }) };

describe("/api/hazards/[id]/vote", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("records a valid vote", async () => {
        const hazard = { id: "hazard-1", upvotes: 1, downvotes: 0 };
        voteHazard.mockResolvedValue(hazard);

        const response = await POST(requestWith({ direction: "up" }), context);

        expect(response.status).toBe(200);
        expect(voteHazard).toHaveBeenCalledWith("hazard-1", "up");
        await expect(response.json()).resolves.toEqual({ hazard });
    });

    test("rejects an unsupported vote direction", async () => {
        const response = await POST(requestWith({ direction: "sideways" }), context);

        expect(response.status).toBe(400);
        expect(voteHazard).not.toHaveBeenCalled();
    });

    test("returns 404 when the hazard does not exist", async () => {
        voteHazard.mockResolvedValue(null);

        const response = await POST(requestWith({ direction: "down" }), context);

        expect(response.status).toBe(404);
    });
});
