import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { requireSameOrigin } from "@/lib/request-security";

describe("requireSameOrigin", () => {
    it("accepts a request forwarded by Render from the public HTTPS origin", () => {
        const request = new NextRequest("http://10.0.0.5:10000/api/hazards", {
            headers: {
                origin: "https://jagruk-bharat-web.onrender.com",
                host: "10.0.0.5:10000",
                "x-forwarded-host": "jagruk-bharat-web.onrender.com",
                "x-forwarded-proto": "https",
            },
        });

        expect(requireSameOrigin(request)).toBeNull();
    });

    it("rejects a request from a different origin", () => {
        const request = new NextRequest("https://jagruk-bharat-web.onrender.com/api/hazards", {
            headers: { origin: "https://malicious.example" },
        });

        expect(requireSameOrigin(request)?.status).toBe(403);
    });
});
