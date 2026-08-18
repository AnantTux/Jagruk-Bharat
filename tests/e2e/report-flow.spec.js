import { expect, test } from "@playwright/test";

test("the sign-in screen is shown for a report request", async ({ page }) => {
    await page.goto("/login?next=/report");

    await expect(page.getByText("Sign in with your account, or continue securely with Google.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("the report page sends signed-out users to sign in and preserves the destination", async ({ page }) => {
    await page.route("**/api/auth/session", (route) => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ user: null }),
    }));
    await page.goto("/report");
    await page.waitForURL((url) => url.pathname === "/login" && url.searchParams.get("next") === "/report");
});
