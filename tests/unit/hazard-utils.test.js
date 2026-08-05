import { afterEach, describe, expect, test, vi } from "vitest";
import {
    formatLatestAlert,
    formatTimeAgo,
    hazardTrustScore,
    parseCoordinateQuery,
    severityColor,
} from "@/lib/hazard-utils";

afterEach(() => {
    vi.useRealTimers();
});

describe("hazard utilities", () => {
    test("maps severity levels to stable marker colors", () => {
        expect(severityColor("high")).toBe("#ef4444");
        expect(severityColor("medium")).toBe("#f59e0b");
        expect(severityColor("low")).toBe("#3b82f6");
    });

    test("calculates community trust score", () => {
        expect(hazardTrustScore({ upvotes: 8, downvotes: 3 })).toBe(5);
    });

    test.each([
        ["28.6139,77.2090", { lat: 28.6139, lng: 77.209 }],
        ["19.076 72.8777", { lat: 19.076, lng: 72.8777 }],
        ["91,75", null],
        ["Delhi", null],
    ])("parses coordinate query %s", (query, expected) => {
        expect(parseCoordinateQuery(query)).toEqual(expected);
    });

    test("formats relative report time", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-05T12:00:00.000Z"));
        expect(formatTimeAgo("2026-08-05T11:45:00.000Z")).toBe("15 min ago");
    });

    test("builds the latest alert from the newest report", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-08-05T12:00:00.000Z"));
        const alert = formatLatestAlert([
            { type: "fire", severity: "high", lat: 28.6, lng: 77.2, createdAt: "2026-08-05T11:58:00.000Z", locationDescription: "Connaught Place", description: "Smoke visible" },
            { type: "flooding", severity: "low", lat: 19.1, lng: 72.9, createdAt: "2026-08-05T10:00:00.000Z" },
        ]);
        expect(alert).toContain("HIGH fire near Connaught Place");
        expect(alert).toContain("Smoke visible");
    });
});
