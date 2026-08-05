import { expect, test } from "@playwright/test";

test("a user can create and verify an account", async ({ page }) => {
    await page.route("**/api/auth/signup", (route) => route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: "Account created.", developmentCode: "123456" }),
    }));
    await page.route("**/api/auth/verify-email", (route) => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "user-1", firstName: "Asha", emailVerified: true } }),
    }));
    await page.route("**/api/hazards", (route) => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ hazards: [] }),
    }));

    await page.goto("/signup");
    await page.getByLabel("First Name").fill("Asha");
    await page.getByLabel("Last Name").fill("Sharma");
    await page.getByLabel("Email Address").fill("asha@example.com");
    await page.getByLabel("State or Union Territory").selectOption({ index: 1 });
    await page.getByLabel("Password", { exact: true }).fill("Safety123");
    await page.getByLabel("Confirm Password").fill("Safety123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Verify your email", { exact: true })).toBeVisible();
    await expect(page.getByText("Development code: 123456")).toBeVisible();
    await page.getByLabel("Six-digit code").fill("123456");
    await page.getByRole("button", { name: "Verify and Continue" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
});
