import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    createHazard: vi.fn(),
    deleteHazardForRateLimit: vi.fn(),
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
    getHazardSubmissionRateLimit: vi.fn(),
    recordHazardSubmission: vi.fn(),
    releaseHazardSubmission: vi.fn(),
}));

import { createHazard, deleteHazardForRateLimit, listHazards } from "@/lib/hazard-store";
import { saveHazardPhotos } from "@/lib/save-hazard-photos";
import { getCurrentUser } from "@/lib/auth";
import { getHazardSubmissionRateLimit, recordHazardSubmission, releaseHazardSubmission } from "@/lib/hazard-rate-limit";
import { GET, POST } from "@/app/api/hazards/route";

describe("/api/hazards", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        getCurrentUser.mockResolvedValue({ _id: "user-1" });
        getHazardSubmissionRateLimit.mockResolvedValue({ allowed: true, remaining: 3, retryAfterSeconds: 60 });
        recordHazardSubmission.mockResolvedValue({ allowed: true, remaining: 2, retryAfterSeconds: 60 });
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
                observationTime: "1hour",
            }),
        });

        const response = await POST(request);

        expect(response.status).toBe(201);
        expect(createHazard).toHaveBeenCalledWith(expect.objectContaining({
            type: "flooding",
            severity: "high",
            lat: 28.6139,
            lng: 77.209,
            observedAt: expect.any(Date),
            reportedByUserId: "user-1",
        }));
        await expect(response.json()).resolves.toEqual({ hazard: created });
        expect(recordHazardSubmission).toHaveBeenCalledWith("user-1");
    });

    test("POST accepts a multipart hazard report with a photo", async () => {
        createHazard.mockResolvedValue({ id: "hazard-photo" });
        saveHazardPhotos.mockResolvedValue(["https://images.example/hazard-photo.jpg"]);
        const form = new FormData();
        form.set("type", "road-accident");
        form.set("severity", "medium");
        form.set("lat", "19.076");
        form.set("lng", "72.8777");
        form.set("contactPhone", "+91 98765 43210");
        form.set("observationTime", "30min");
        form.append("photos", new File(["photo-data"], "evidence.jpg", { type: "image/jpeg" }));

        const response = await POST(new Request("http://localhost/api/hazards", { method: "POST", body: form }));

        expect(response.status).toBe(201);
        expect(createHazard).toHaveBeenCalledWith(expect.objectContaining({
            type: "road-accident",
            contactPhone: "+91 98765 43210",
            observedAt: expect.any(Date),
            reportedByUserId: "user-1",
            photoUrls: ["https://images.example/hazard-photo.jpg"],
        }), expect.any(String));
        expect(recordHazardSubmission).toHaveBeenCalledWith("user-1");
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
        getHazardSubmissionRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 1800 });
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "flooding", severity: "high", lat: 20, lng: 75 }),
        });

        const response = await POST(request);

        expect(response.status).toBe(429);
        expect(response.headers.get("retry-after")).toBe("1800");
        expect(createHazard).not.toHaveBeenCalled();
        expect(recordHazardSubmission).not.toHaveBeenCalled();
    });

    test("does not count an invalid report", async () => {
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "unknown", severity: "high", lat: 20, lng: 75 }),
        });

        await POST(request);

        expect(recordHazardSubmission).not.toHaveBeenCalled();
    });

    test("removes a race-condition report that would exceed the limit", async () => {
        createHazard.mockResolvedValue({ id: "hazard-over-limit" });
        recordHazardSubmission.mockResolvedValue({ allowed: false, remaining: 0, retryAfterSeconds: 1200 });
        const request = new Request("http://localhost/api/hazards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "fire", severity: "high", lat: 20, lng: 75 }),
        });

        const response = await POST(request);

        expect(response.status).toBe(429);
        expect(deleteHazardForRateLimit).toHaveBeenCalledWith("hazard-over-limit", "user-1");
        expect(releaseHazardSubmission).toHaveBeenCalledWith("user-1");
    });
});
