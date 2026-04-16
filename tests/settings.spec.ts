import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test("renders page heading", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Scanner Settings" })).toBeVisible();
  });

  test("renders all filter sliders", async ({ page }) => {
    await page.goto("/settings");
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(5);
  });

  test("shows default R² threshold of 0.70", async ({ page }) => {
    await page.goto("/settings");
    // Default label shows 0.70
    await expect(page.getByText("0.70")).toBeVisible();
  });

  test("shows all setting section labels", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Minimum R² Threshold")).toBeVisible();
    await expect(page.getByText("Minimum Period (months)")).toBeVisible();
    await expect(page.getByText("Maximum Period (months)")).toBeVisible();
    await expect(page.getByText("Minimum Market Cap")).toBeVisible();
    await expect(page.getByText("Minimum Average Volume")).toBeVisible();
  });

  test("Save Settings button is present", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "Save Settings" })).toBeVisible();
  });

  test("Reset Defaults button is present", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "Reset Defaults" })).toBeVisible();
  });

  test("Save Settings button shows confirmation state", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByRole("button", { name: "✓ Saved" })).toBeVisible();
  });

  test("settings persist to localStorage on save", async ({ page }) => {
    await page.goto("/settings");

    // Move the R² slider to 0.80 — use React's native input value setter
    // so the synthetic onChange fires correctly
    const slider = page.locator('input[type="range"]').first();
    await slider.evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeSetter?.call(el, "0.8");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.getByRole("button", { name: "Save Settings" }).click();

    // Reload and check localStorage
    await page.reload();
    const saved = await page.evaluate(() => localStorage.getItem("chartscan:settings"));
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.minR2).toBeCloseTo(0.8, 1);
  });

  test("Reset Defaults clears localStorage and resets UI", async ({ page }) => {
    // First save something
    await page.goto("/settings");
    await page.evaluate(() =>
      localStorage.setItem("chartscan:settings", JSON.stringify({ minR2: 0.95 }))
    );
    await page.reload();

    // Now reset
    await page.getByRole("button", { name: "Reset Defaults" }).click();
    const saved = await page.evaluate(() => localStorage.getItem("chartscan:settings"));
    expect(saved).toBeNull();
  });

  test("informational note about scan requirement is shown", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/require re-running the scan/i)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navigation links work from dashboard", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [], total: 0, page: 1, limit: 48, lastScan: null }),
      });
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("logo link navigates to dashboard", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("link", { name: /ChartScan/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("active nav link is highlighted on dashboard", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ results: [], total: 0, page: 1, limit: 48, lastScan: null }),
      });
    });

    await page.goto("/");
    const dashboardLink = page.getByRole("link", { name: "Dashboard" });
    // Active links have a blue background
    await expect(dashboardLink).toHaveCSS("background", /rgba\(59, 130, 246/);
  });

  test("active nav link is highlighted on settings page", async ({ page }) => {
    await page.goto("/settings");
    const settingsLink = page.getByRole("link", { name: "Settings" });
    await expect(settingsLink).toHaveCSS("background", /rgba\(59, 130, 246/);
  });
});
