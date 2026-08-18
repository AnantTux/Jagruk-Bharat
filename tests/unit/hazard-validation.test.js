import { describe, expect, test } from "vitest";
import { HAZARD_LIMITS, isSeverity, parseHazardFormData, validateHazardInput } from "@/lib/hazard-validation";

describe("hazard validation", () => {
    test("accepts and normalizes a valid hazard", () => {
        expect(validateHazardInput({
            type: "flooding",
            severity: "high",
            lat: "28.6139",
            lng: "77.2090",
            description: "  Road is under water  ",
            locationDescription: "  Near the metro station  ",
            contactPhone: "  +91 98765 43210  ",
            observationTime: "1hour",
            emergency: "true",
        })).toMatchObject({
            type: "flooding",
            severity: "high",
            lat: 28.6139,
            lng: 77.209,
            description: "Road is under water",
            locationDescription: "Near the metro station",
            contactPhone: "+91 98765 43210",
            emergency: true,
            photoUrls: undefined,
        });
        expect(validateHazardInput({ type: "flooding", severity: "high", lat: 28.6139, lng: 77.209, observationTime: "1hour" }).observedAt).toBeInstanceOf(Date);
    });

    test.each(["critical", "", null, undefined])("rejects unsupported severity %s", (severity) => {
        expect(isSeverity(severity)).toBe(false);
        expect(validateHazardInput({ type: "fire", severity, lat: 20, lng: 75 })).toBeNull();
    });

    test("rejects unknown hazard types", () => {
        expect(validateHazardInput({ type: "not-supported", severity: "low", lat: 20, lng: 75 })).toBeNull();
    });

    test.each([
        { lat: 91, lng: 75 },
        { lat: -91, lng: 75 },
        { lat: 20, lng: 181 },
        { lat: "not-a-number", lng: 75 },
    ])("rejects invalid coordinates: $lat, $lng", ({ lat, lng }) => {
        expect(validateHazardInput({ type: "fire", severity: "medium", lat, lng })).toBeNull();
    });

    test("rejects text beyond configured limits", () => {
        expect(validateHazardInput({
            type: "fire",
            severity: "medium",
            lat: 20,
            lng: 75,
            description: "x".repeat(HAZARD_LIMITS.description + 1),
        })).toBeNull();
    });

    test("parses browser FormData through the same validation path", () => {
        const form = new FormData();
        form.set("type", "road-accident");
        form.set("severity", "medium");
        form.set("lat", "19.076");
        form.set("lng", "72.8777");
        form.set("emergency", "1");
        form.set("observationTime", "30min");

        expect(parseHazardFormData(form)).toMatchObject({
            type: "road-accident",
            severity: "medium",
            lat: 19.076,
            lng: 72.8777,
            emergency: true,
            observedAt: expect.any(Date),
        });
    });
});
