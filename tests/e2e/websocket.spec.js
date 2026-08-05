import { expect, test } from "@playwright/test";

test("the live-update WebSocket accepts browser connections", async ({ page }) => {
    await page.route("**/api/hazards", (route) => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ hazards: [] }),
    }));
    await page.goto("/");

    const message = await page.evaluate(() => new Promise((resolve, reject) => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const socket = new WebSocket(`${protocol}//${window.location.host}/ws/hazards`);
        const timeout = setTimeout(() => reject(new Error("WebSocket did not connect")), 5000);

        socket.onmessage = (event) => {
            clearTimeout(timeout);
            socket.close();
            resolve(JSON.parse(event.data));
        };
        socket.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("WebSocket connection failed"));
        };
    }));

    expect(message).toMatchObject({ type: "connected" });
});
