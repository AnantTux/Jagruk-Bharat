import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "pnpm dev",
        url: "http://localhost:3000/report",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
            MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ananttatt-test",
        },
    },
});
