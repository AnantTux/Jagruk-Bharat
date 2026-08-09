import { expect, test } from "@playwright/test";

test("the sign-in screen preserves the report destination", async ({ page }) => {
    await page.goto("/login?next=/report");

    await expect(page.getByText("Sign in with your verified Jagruk Bharat account.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});
