import { expect, test } from "@playwright/test";

test("the signup screen presents the verified-account flow", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("Join Jagruk Bharat", { exact: true })).toBeVisible();
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("State or Union Territory")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
    await expect(page.getByText("Create a verified account to report public hazards.")).toBeVisible();
});
