import { test, expect } from "@playwright/test";

test.describe("Calendar Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays app title", async ({ page }) => {
    await expect(page.getByText("Ethereal Calendar")).toBeVisible();
  });

  test("displays default 12 months of calendar pages", async ({ page }) => {
    const pages = page.locator("[data-month]");
    await expect(pages).toHaveCount(12);
  });

  test("displays month label in preview", async ({ page }) => {
    await expect(page.locator("[data-month='2026-04'] .font-heading").first()).toBeVisible();
  });

  test("displays weekday headers", async ({ page }) => {
    await expect(page.getByText("Sun").first()).toBeVisible();
    await expect(page.getByText("Mon").first()).toBeVisible();
  });

  test("month jump navigation exists", async ({ page }) => {
    const jumpButton = page.locator("button", { hasText: "04" });
    await expect(jumpButton).toBeVisible();
  });

  test("help button opens print guide modal", async ({ page }) => {
    await page.getByLabel("Help").click();
    await expect(page.getByText("ヘルプ")).toBeVisible();
    await page.getByText("ブラウザからPDF化する").click();
    await expect(page.getByText("Ctrl + P")).toBeVisible();
  });

  test("export button is visible in header", async ({ page }) => {
    await expect(page.getByRole("banner").getByRole("button", { name: "出力" })).toBeVisible();
  });
});
