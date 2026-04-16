import { test, expect } from "@playwright/test";
import {
  MOCK_STOCKS_RESPONSE,
  MOCK_EMPTY_RESPONSE,
  MOCK_SCAN_RESPONSE,
} from "./fixtures";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the stocks API
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });
  });

  test("renders page title and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chart.*Scan/i);
    await expect(page.getByText("ChartScan")).toBeVisible();
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Settings")).toBeVisible();
  });

  test("shows stock cards after load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("MRNA")).toBeVisible();
    await expect(page.getByText("REGN")).toBeVisible();
    await expect(page.getByText("VRTX")).toBeVisible();
  });

  test("displays R² score on each card", async ({ page }) => {
    await page.goto("/");
    // First stock has R² of 0.923
    await expect(page.getByText("0.923")).toBeVisible();
  });

  test("displays rank numbers on cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("#1")).toBeVisible();
    await expect(page.getByText("#2")).toBeVisible();
    await expect(page.getByText("#3")).toBeVisible();
  });

  test("shows last scan timestamp", async ({ page }) => {
    await page.goto("/");
    // Last scan label appears in header
    await expect(page.getByText(/Last scan/i)).toBeVisible();
  });

  test("shows result count in subtitle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/3 stocks/i)).toBeVisible();
  });

  test("clicking a stock card navigates to detail page", async ({ page }) => {
    await page.route("/api/stocks/MRNA", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ error: "mocked" }),
      });
    });

    await page.goto("/");
    await page.getByText("MRNA").first().click();
    await expect(page).toHaveURL(/\/stocks\/MRNA/i);
  });

  test("empty state shows when no results", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_EMPTY_RESPONSE),
      });
    });

    await page.goto("/");
    await expect(page.getByText(/No scan results yet/i)).toBeVisible();
  });
});

test.describe("Dashboard — Filter Bar", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });
  });

  test("R² slider is visible and interactive", async ({ page }) => {
    await page.goto("/");
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    // Verify default value
    await expect(slider).toHaveValue("0.7");
  });

  test("period buttons render all four options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("3mo")).toBeVisible();
    await expect(page.getByText("6mo")).toBeVisible();
    await expect(page.getByText("9mo")).toBeVisible();
    await expect(page.getByText("12mo")).toBeVisible();
  });

  test("clicking a period button triggers re-fetch", async ({ page }) => {
    let requestUrl = "";
    await page.route("/api/stocks**", (route) => {
      requestUrl = route.request().url();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    await page.goto("/");
    await page.getByText("3mo").click();
    await expect(() => expect(requestUrl).toContain("period=3")).toPass({ timeout: 3000 });
  });

  test("sort buttons render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Score")).toBeVisible();
    await expect(page.getByRole("button", { name: "R²" })).toBeVisible();
    await expect(page.getByText("Slope")).toBeVisible();
  });

  test("clicking Sort by R² triggers re-fetch with correct param", async ({ page }) => {
    let requestUrl = "";
    await page.route("/api/stocks**", (route) => {
      requestUrl = route.request().url();
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "R²" }).click();
    await expect(() => expect(requestUrl).toContain("sortBy=rSquared")).toPass({ timeout: 3000 });
  });
});

test.describe("Dashboard — Scan Button", () => {
  test("scan button is visible", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    await page.goto("/");
    await expect(page.getByText("⚡ Scan Now")).toBeVisible();
  });

  test("scan button shows scanning state while running", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    // Slow down the scan response
    await page.route("/api/scan", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCAN_RESPONSE),
      });
    });

    await page.goto("/");
    await page.getByText("⚡ Scan Now").click();
    await expect(page.getByText("Scanning...")).toBeVisible();
  });

  test("scan button shows done state after completion", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    await page.route("/api/scan", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_SCAN_RESPONSE),
      });
    });

    await page.goto("/");
    await page.getByText("⚡ Scan Now").click();
    await expect(page.getByText("✓ Done")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Scanned 487 stocks/i)).toBeVisible();
  });

  test("scan button shows error state on failure", async ({ page }) => {
    await page.route("/api/stocks**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCKS_RESPONSE),
      });
    });

    await page.route("/api/scan", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "FMP API unavailable" }),
      });
    });

    await page.goto("/");
    await page.getByText("⚡ Scan Now").click();
    await expect(page.getByText("✕ Error")).toBeVisible({ timeout: 5000 });
  });
});
