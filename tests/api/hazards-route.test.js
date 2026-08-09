import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    createHazard: vi.fn(),
    listHazards: vi.fn(),
    publicHazard: vi.fn((hazard) => hazard),
}));

vi.mock("@/lib/save-hazard-photos", () => ({
    saveHazardPhotos: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/hazard-rate-limit", () => ({
    checkHazardSubmissionRateLimit: vi.fn(),
    getRequestIp: vi.fn(),
}));

import { createHazard, listHazards } from "@/lib/hazard-store";
import { getCurrentUser } from "@/lib/auth";
import { checkHazardSubmissionRateLimit } from "@/lib/hazard-rate-limit";
import { GET, POST } from "@/app/api/hazards/route";

describe("/api/hazards", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        getCurrentUser.mockResolvedValue({ _id: "user-1" });
        checkHazardSubmissionRateLimit.mockResolvedValue({ allowed: true, remaining: 2, retryAfterSeconds: 60 });
    });

    test("GET returns hazards from the store", async () => {
        const hazards = [{ id: "hazard-1", type: "fire" }];
        listHazards.mockResolvedValue(hazards);

        const response = await GET();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ hazards });
    });

    test("POST validates and creates a JSON hazard", async () => {
        const created = { id: "hazard-1", type: "flooding", severity: "high" };
        createHazard.mockResolvedValue(created);
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "flooding",
                severity: "high",
                lat: 28.6139,
                lng: 77.209,
                description: "Water on the road",
            }),
        });

        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(createHazard).toHaveBeenCalledWith(expect.objectContaining({
            type: "flooding",
            severity: "high",
            lat: 28.6139,
            lng: 77.209,
            reportedByUserId: "user-1",
        }));
        await expect(response.json()).resolves.toEqual({ hazard: created });
    });

    test("POST requires a verified signed-in user", async () => {
        getCurrentUser.mockResolvedValue(null);
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "flooding", severity: "high", lat: 20, lng: 75 }),
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
        expect(createHazard).not.toHaveBeenCalled();
    });

    test("POST rejects invalid reports without calling the store", async () => {
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "unknown", severity: "high", lat: 20, lng: 75 }),
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(createHazard).not.toHaveBeenCalled();
    });

    test("POST blocks an IP after its hourly submission limit", async () => {
        checkHazardSubmissionRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 1800 });
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "flooding", severity: "high", lat: 20, lng: 75 }),
        });

        const response = await POST(request);

        expect(response.status).toBe(429);
        expect(response.headers.get("retry-after")).toBe("1800");
        expect(createHazard).not.toHaveBeenCalled();
    });
});
