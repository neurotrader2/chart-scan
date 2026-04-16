import { test, expect } from "@playwright/test";
import { MOCK_STOCK_DETAIL } from "./fixtures";

test.describe("Stock Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/stocks/MRNA", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCK_DETAIL),
      });
    });
  });

  test("renders ticker symbol prominently", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByRole("heading", { name: "MRNA" })).toBeVisible();
  });

  test("renders stock name", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("Moderna Inc.")).toBeVisible();
  });

  test("renders exchange and last scan info", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("NASDAQ")).toBeVisible();
    await expect(page.getByText(/Last scan/i)).toBeVisible();
  });

  test("renders period tabs", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("3 months")).toBeVisible();
    await expect(page.getByText("6 months")).toBeVisible();
    await expect(page.getByText("9 months")).toBeVisible();
  });

  test("renders metrics panel with R² score", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("R² Score")).toBeVisible();
    await expect(page.getByText("0.923")).toBeVisible();
  });

  test("renders annualized return metric", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("Annualized Return")).toBeVisible();
    // 0.182 * 100 = +18.2%
    await expect(page.getByText("+18.2%")).toBeVisible();
  });

  test("renders composite score", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("Composite Score")).toBeVisible();
  });

  test("renders current price", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText("Current Price")).toBeVisible();
  });

  test("renders the price chart", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    // Recharts renders an SVG
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 5000 });
  });

  test("renders the regression line legend", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    // Match the legend span exactly (not the "dashed regression line" text in the guide)
    await expect(page.getByText("Regression", { exact: true })).toBeVisible();
  });

  test("switching period tabs updates metrics", async ({ page }) => {
    await page.goto("/stocks/MRNA");

    // Default is 6mo — R² should be 0.923
    await expect(page.getByText("0.923")).toBeVisible();

    // Switch to 3mo — R² should be 0.891
    await page.getByText("3 months").click();
    await expect(page.getByText("0.891")).toBeVisible();
  });

  test("back button navigates to dashboard", async ({ page }) => {
    // Use a URL predicate so this only matches the list endpoint (/api/stocks?...)
    // and doesn't conflict with the detail endpoint (/api/stocks/MRNA) from beforeEach
    await page.route(
      (url) => url.pathname === "/api/stocks",
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ results: [], total: 0, page: 1, limit: 48, lastScan: null }),
        });
      }
    );

    await page.goto("/stocks/MRNA");
    await page.getByText("← Dashboard").click();
    await expect(page).toHaveURL("/");
  });

  test("shows 404 state when stock not found", async ({ page }) => {
    await page.route("/api/stocks/FAKE", (route) => {
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "No scan results found for FAKE" }),
      });
    });

    await page.goto("/stocks/FAKE");
    await expect(page.getByText(/No scan results found/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows interpretation guide section", async ({ page }) => {
    await page.goto("/stocks/MRNA");
    await expect(page.getByText(/How to interpret/i)).toBeVisible();
    await expect(page.getByText(/R-squared/i)).toBeVisible();
  });
});
