import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/global-setup";

async function openAppearance(page: Page) {
  await page.getByRole("button", { name: "見た目", exact: true }).click();
  await expect(page.getByText("テーマ", { exact: true })).toBeVisible();
}

test.describe("Design Customization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("theme grid shows available themes", async ({ page }) => {
    await openAppearance(page);
    // Theme grid should have multiple theme options
    const themeButtons = page.locator(".grid-cols-3 button");
    const count = await themeButtons.count();
    expect(count).toBeGreaterThan(1);
  });

  test("all themes keep a white page and change the month title color", async ({ page }) => {
    await openAppearance(page);
    const calendarArea = page.getByTestId("calendar-area").first();
    const pageOuter = page.getByTestId("page-container").first().locator("..");
    const monthTitle = calendarArea.locator(":scope > div > div").first();
    const expectedColors = {
      Classic: "rgb(17, 24, 39)",
      Monochrome: "rgb(55, 65, 81)",
      Slate: "rgb(30, 58, 95)",
      Sepia: "rgb(120, 53, 15)",
      Forest: "rgb(20, 83, 45)",
      Minimal: "rgb(38, 38, 38)",
    };

    for (const [theme, color] of Object.entries(expectedColors)) {
      const button = page.getByRole("button", { name: theme, exact: true });
      await button.click();
      await expect(button).toHaveClass(/ring-2/);
      await expect(pageOuter).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(monthTitle).toHaveCSS("color", color);
    }
  });

  test("font weight buttons work", async ({ page }) => {
    await openAppearance(page);
    const boldButton = page.getByRole("button", { name: "太字" });
    await boldButton.click();
    await expect(boldButton).toBeVisible();
  });

  test("image toggle can be clicked", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "画像を使用", exact: true });
    await expect(page.getByTestId("image-area").first()).toBeVisible();
    await toggle.click();

    // After toggling off, image areas should disappear
    await expect(page.getByTestId("image-area").first()).not.toBeVisible();
  });

  test("re-enabling images shows image areas", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "画像を使用", exact: true });

    // Toggle off
    await toggle.click();
    await expect(page.getByTestId("image-area").first()).not.toBeVisible();

    // Toggle on
    await toggle.click();
    await expect(page.getByTestId("image-area").first()).toBeVisible();
  });

  test("content alignment buttons work", async ({ page }) => {
    // Content alignment is now in the floating image control box
    const controlBox = page.getByTestId("image-control-box");
    await expect(controlBox).toBeVisible();

    // "中央" in the カレンダー配置 section of the floating box
    const centerButton = controlBox.getByRole("button", { name: "中央" }).last();
    await centerButton.click();
    await expect(centerButton).toBeVisible();

    const bottomButton = controlBox.getByRole("button", { name: "下揃え" }).last();
    await bottomButton.click();
    await expect(bottomButton).toBeVisible();
  });

  test("slider controls are visible", async ({ page }) => {
    await openAppearance(page);
    await expect(page.getByText("月タイトル")).toBeVisible();
    await expect(page.getByText("日付")).toBeVisible();
    await expect(page.getByText("曜日", { exact: true })).toBeVisible();
    await expect(page.getByText("セル余白")).toBeVisible();
    await expect(page.getByText("ヘッダー間隔")).toBeVisible();
    await expect(page.getByText("上余白")).toBeVisible();
  });
});
