import { describe, expect, test } from "vitest";
import { distanceInKm, parseVoterLocation } from "@/lib/vote-proximity";

describe("vote proximity", () => {
    test("accepts valid coordinate input", () => {
        expect(parseVoterLocation({ lat: 28.6139, lng: 77.209 })).toEqual({ lat: 28.6139, lng: 77.209 });
        expect(parseVoterLocation({ lat: 100, lng: 77 })).toBeNull();
    });

    test("calculates geographic distance in kilometres", () => {
        expect(distanceInKm({ lat: 28.6139, lng: 77.209 }, { lat: 28.617, lng: 77.23 })).toBeLessThan(5);
        expect(distanceInKm({ lat: 28.6139, lng: 77.209 }, { lat: 19.076, lng: 72.8777 })).toBeGreaterThan(1000);
    });
});
