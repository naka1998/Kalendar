import type { Page } from "@playwright/test";
import { mobileTest, test, expect } from "./fixtures/global-setup";

async function openCalendarForSnapshots(page: Page) {
  // Keep the reference images tied to a fixed calendar period.
  await page.addInitScript(() => {
    localStorage.setItem(
      "kalendar-user-settings",
      JSON.stringify({ version: 1, state: { startMonth: "2026-04", endMonth: "2027-03" } }),
    );
  });
  await page.goto("/");
  await expect(page.locator("[data-month]").first()).toHaveAttribute("data-month", "2026-04");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
}

test.describe("Visual Regression - Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await openCalendarForSnapshots(page);
  });

  test("default calendar view", async ({ page }) => {
    // Capture the full app in its default state
    await expect(page).toHaveScreenshot("desktop-default.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("calendar page preview renders correctly", async ({ page }) => {
    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toBeVisible();
    await expect(firstPage).toHaveScreenshot("desktop-calendar-page.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("theme switch - Slate", async ({ page }) => {
    await page.getByText("見た目").click();
    await page.getByText("テーマ").waitFor();

    await page.getByRole("button", { name: "Slate", exact: true }).click();
    await page.waitForTimeout(500);

    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toHaveScreenshot("desktop-slate-theme.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("theme switch - Sepia", async ({ page }) => {
    await page.getByText("見た目").click();
    await page.getByText("テーマ").waitFor();

    await page.getByRole("button", { name: "Sepia", exact: true }).click();
    await page.waitForTimeout(500);

    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toHaveScreenshot("desktop-sepia-theme.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("sidebar expanded state", async ({ page }) => {
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    await page.waitForTimeout(300);

    const sidebar = page.locator("aside").first();
    await sidebar.evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(sidebar).toHaveScreenshot("desktop-sidebar-basic.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("appearance section expanded", async ({ page }) => {
    await page.getByText("見た目").click();
    await page.waitForTimeout(300);

    const sidebar = page.locator("aside").first();
    await sidebar.evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(sidebar).toHaveScreenshot("desktop-sidebar-design.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("image disabled layout", async ({ page }) => {
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    const toggleContainer = page.getByText("画像を使用").locator("..");
    const toggle = toggleContainer.locator("button");
    await toggle.click();
    await page.waitForTimeout(500);

    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toHaveScreenshot("desktop-no-image.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("landscape orientation", async ({ page }) => {
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    const landscapeButton = page.getByRole("button", { name: "横", exact: true });
    await landscapeButton.click();
    await page.waitForTimeout(500);

    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toHaveScreenshot("desktop-landscape.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

mobileTest.describe("Visual Regression - Mobile", () => {
  mobileTest.setTimeout(120_000);

  mobileTest.beforeEach(async ({ page }) => {
    await openCalendarForSnapshots(page);
  });

  mobileTest("mobile default view", async ({ page }) => {
    await expect(page).toHaveScreenshot("mobile-default.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });

  mobileTest("mobile calendar page", async ({ page }) => {
    const firstPage = page.locator("[data-month]").first();
    await expect(firstPage).toBeVisible();
    await expect(firstPage).toHaveScreenshot("mobile-calendar-page.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
