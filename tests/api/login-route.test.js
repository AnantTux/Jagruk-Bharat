import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    createSession: vi.fn(),
    publicUser: vi.fn((user) => ({ id: user._id, email: user.email })),
}));
vi.mock("@/lib/auth-crypto", () => ({
    normalizeEmail: (email) => String(email).trim().toLowerCase(),
    verifyPassword: vi.fn(),
}));
vi.mock("@/lib/mongodb", () => ({ connectToDatabase: vi.fn() }));
vi.mock("@/lib/models/user", () => ({ User: { findOne: vi.fn() } }));
vi.mock("@/lib/hazard-rate-limit", () => ({
    checkRateLimit: vi.fn(),
    getRequestIp: vi.fn(() => "127.0.0.1"),
}));
vi.mock("@/lib/audit", () => ({ writeAuditLog: vi.fn() }));

import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-crypto";
import { User } from "@/lib/models/user";
import { checkRateLimit } from "@/lib/hazard-rate-limit";
import { POST } from "@/app/api/auth/login/route";

function loginRequest() {
    return new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "Person@Example.com", password: "Safety123" }),
    });
}

function returnUser(user) {
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(user) });
}

describe("/api/auth/login", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        checkRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 60 });
    });

    test("rejects an incorrect password", async () => {
        returnUser({ _id: "user-1", passwordHash: "stored" });
        verifyPassword.mockResolvedValue(false);
        const response = await POST(loginRequest());
        expect(response.status).toBe(401);
        expect(createSession).not.toHaveBeenCalled();
    });

    test("prevents a suspended account from signing in", async () => {
        returnUser({ _id: "user-1", passwordHash: "stored", status: "suspended", emailVerifiedAt: new Date() });
        verifyPassword.mockResolvedValue(true);
        const response = await POST(loginRequest());
        expect(response.status).toBe(403);
        expect(createSession).not.toHaveBeenCalled();
    });

    test("creates a session for a verified active account", async () => {
        const user = { _id: "user-1", email: "person@example.com", passwordHash: "stored", status: "active", emailVerifiedAt: new Date() };
        returnUser(user);
        verifyPassword.mockResolvedValue(true);
        const response = await POST(loginRequest());
        expect(response.status).toBe(200);
        expect(createSession).toHaveBeenCalledWith("user-1");
        await expect(response.json()).resolves.toEqual({ user: { id: "user-1", email: "person@example.com" } });
    });
});
