import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/hazard-store", () => ({ findNearbyHazards: vi.fn() }));

import { findNearbyHazards } from "@/lib/hazard-store";
import { GET } from "@/app/api/hazards/near/route";

describe("/api/hazards/near", () => {
    beforeEach(() => vi.resetAllMocks());

    test("uses MongoDB's location query for a valid radius", async () => {
        findNearbyHazards.mockResolvedValue([{ id: "hazard-1" }]);
        const response = await GET(new Request("http://localhost/api/hazards/near?lat=28.6139&lng=77.209&radiusKm=5"));

        expect(response.status).toBe(200);
        expect(findNearbyHazards).toHaveBeenCalledWith({ lat: 28.6139, lng: 77.209, radiusKm: 5 });
        await expect(response.json()).resolves.toEqual({ hazards: [{ id: "hazard-1" }] });
    });

    test("rejects invalid search coordinates and radii", async () => {
        const response = await GET(new Request("http://localhost/api/hazards/near?lat=200&lng=77&radiusKm=100"));

        expect(response.status).toBe(400);
        expect(findNearbyHazards).not.toHaveBeenCalled();
    });
});
