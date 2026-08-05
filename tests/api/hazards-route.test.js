import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({
    createHazard: vi.fn(),
    listHazards: vi.fn(),
}));

vi.mock("@/lib/save-hazard-photos", () => ({
    saveHazardPhotos: vi.fn(),
}));

import { createHazard, listHazards } from "@/lib/hazard-store";
import { GET, POST } from "@/app/api/hazards/route";

describe("/api/hazards", () => {
    beforeEach(() => {
        vi.resetAllMocks();
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
        }));
        await expect(response.json()).resolves.toEqual({ hazard: created });
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
});
