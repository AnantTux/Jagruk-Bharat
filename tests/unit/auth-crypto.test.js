import { describe, expect, test } from "vitest";
import { createSessionToken, createVerificationCode, hashPassword, hashToken, normalizeEmail, validatePassword, verifyPassword } from "@/lib/auth-crypto";

describe("authentication crypto", () => {
    test("normalizes email addresses", () => {
        expect(normalizeEmail("  Person@Example.COM ")).toBe("person@example.com");
    });

    test("requires a practical minimum password", () => {
        expect(validatePassword("short1")).toBeTruthy();
        expect(validatePassword("onlyletters")).toBeTruthy();
        expect(validatePassword("Safety123")).toBeNull();
    });

    test("hashes and verifies passwords without storing the password", async () => {
        const hash = await hashPassword("Safety123");
        expect(hash).not.toContain("Safety123");
        await expect(verifyPassword("Safety123", hash)).resolves.toBe(true);
        await expect(verifyPassword("Wrong123", hash)).resolves.toBe(false);
    });

    test("creates unpredictable session tokens and stable token hashes", () => {
        const first = createSessionToken();
        const second = createSessionToken();
        expect(first).not.toBe(second);
        expect(hashToken(first)).toBe(hashToken(first));
        expect(hashToken(first)).not.toBe(hashToken(second));
    });

    test("creates six-digit verification codes", () => {
        expect(createVerificationCode()).toMatch(/^\d{6}$/);
    });
});
