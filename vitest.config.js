import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL(".", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["tests/unit/**/*.test.js", "tests/api/**/*.test.js"],
        clearMocks: true,
        restoreMocks: true,
    },
});
