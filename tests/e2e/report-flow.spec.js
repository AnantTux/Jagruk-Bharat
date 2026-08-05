import { expect, test } from "@playwright/test";

test("a citizen can complete the hazard reporting flow", async ({ page }) => {
    let submittedHazard = null;

    await page.route("**/api/hazards", async (route) => {
        if (route.request().method() === "POST") {
            const input = route.request().postDataJSON();
            submittedHazard = {
                id: "e2e-hazard-1",
                ...input,
                reports: 1,
                upvotes: 0,
                downvotes: 0,
                createdAt: new Date().toISOString(),
            };
            await route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({ hazard: submittedHazard }),
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ hazards: submittedHazard ? [submittedHazard] : [] }),
        });
    });

    await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
    await page.goto("/report");

    await page.getByText("Road Accident", { exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByText("Medium Risk", { exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByLabel("Latitude").fill("28.6139");
    await page.getByLabel("Longitude").fill("77.2090");
    await page.getByLabel("Location Description").fill("Near Connaught Place");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByLabel("Detailed Description").fill("Two vehicles are blocking one traffic lane.");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByLabel("Submit this report anonymously").click();
    await page.getByRole("button", { name: "Submit Report" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    expect(submittedHazard).toMatchObject({
        type: "road-accident",
        severity: "medium",
        lat: 28.6139,
        lng: 77.209,
        locationDescription: "Near Connaught Place",
    });
});
