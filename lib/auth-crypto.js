import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validatePassword(password) {
    if (typeof password !== "string" || password.length < 8 || password.length > 128)
        return "Password must be between 8 and 128 characters.";
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
        return "Password must contain at least one letter and one number.";
    return null;
}

export async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    return `scrypt$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
    const [algorithm, salt, expectedHex] = String(storedHash).split("$");
    if (algorithm !== "scrypt" || !salt || !expectedHex)
        return false;
    const expected = Buffer.from(expectedHex, "hex");
    const actual = Buffer.from(await scrypt(password, salt, expected.length));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken() {
    return randomBytes(32).toString("base64url");
}

export function createVerificationCode() {
    return String(randomInt(100000, 1000000));
}

export function hashToken(token) {
    return createHash("sha256").update(String(token)).digest("hex");
}
