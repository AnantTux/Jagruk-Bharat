import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    voteHazard: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    getCurrentUser: vi.fn(),
}));

import { voteHazard } from "@/lib/hazard-store";
import { getCurrentUser } from "@/lib/auth";
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
        getCurrentUser.mockResolvedValue({ _id: "user-1" });
    });

    test("records a valid vote", async () => {
        const hazard = { id: "hazard-1", upvotes: 1, downvotes: 0 };
        voteHazard.mockResolvedValue({ hazard });

        const response = await POST(requestWith({ direction: "up", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(200);
        expect(voteHazard).toHaveBeenCalledWith("hazard-1", "user-1", "up", { lat: 28.6139, lng: 77.209 });
        await expect(response.json()).resolves.toEqual({ hazard });
    });

    test("rejects an unsupported vote direction", async () => {
        const response = await POST(requestWith({ direction: "sideways", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(400);
        expect(voteHazard).not.toHaveBeenCalled();
    });

    test("requires a verified signed-in user", async () => {
        getCurrentUser.mockResolvedValue(null);

        const response = await POST(requestWith({ direction: "up", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(401);
        expect(voteHazard).not.toHaveBeenCalled();
    });

    test("rejects a second vote from the same user", async () => {
        voteHazard.mockResolvedValue({ reason: "already-voted" });

        const response = await POST(requestWith({ direction: "up", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(409);
        await expect(response.json()).resolves.toEqual({ error: "You have already voted on this hazard." });
    });

    test("returns 404 when the hazard does not exist", async () => {
        voteHazard.mockResolvedValue({ reason: "not-found" });

        const response = await POST(requestWith({ direction: "down", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(404);
    });

    test("requires a valid browser location before recording a vote", async () => {
        const response = await POST(requestWith({ direction: "up" }), context);

        expect(response.status).toBe(400);
        expect(voteHazard).not.toHaveBeenCalled();
    });

    test("rejects a vote outside the nearby verification radius", async () => {
        voteHazard.mockResolvedValue({ reason: "too-far" });

        const response = await POST(requestWith({ direction: "up", voterLocation: { lat: 28.6139, lng: 77.209 } }), context);

        expect(response.status).toBe(403);
    });
});
