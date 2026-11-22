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
    const pageOuter = page.getByTestId("page-container").first().locator("..");
    const monthTitle = page.getByTestId("month-title").first();
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

  test("font cards show all categories and update the month title", async ({ page }) => {
    await openAppearance(page);
    const sidebar = page.locator("aside").first();
    for (const [category, count] of [
      ["かっこいい", 2],
      ["しっかり", 3],
      ["かわいい", 3],
      ["おしゃれ", 3],
    ] as const) {
      const group = sidebar.getByRole("region", { name: category, exact: true });
      await expect(group.getByRole("button")).toHaveCount(count);
      await expect(group.getByText("2027 月 6", { exact: true })).toHaveCount(count);
    }

    const monthTitle = page
      .getByTestId("calendar-area")
      .first()
      .locator(":scope > div > div")
      .first();
    for (const font of ["Inter", "M PLUS Rounded 1c", "Shippori Mincho"]) {
      const card = sidebar.getByRole("button", { name: font, exact: true });
      await card.click();
      await expect(card).toHaveAttribute("aria-pressed", "true");
      await expect
        .poll(() =>
          monthTitle.evaluate((title) => getComputedStyle(title).fontFamily.replaceAll('"', "")),
        )
        .toBe(font);
      await expect(monthTitle).toHaveCSS("font-weight", "800");
    }
    await expect(page.getByTestId("page-container").first()).toHaveCSS("padding-top", "20px");
  });

  test("font weight buttons work", async ({ page }) => {
    await openAppearance(page);
    await page.getByRole("button", { name: "サイズと配置", exact: true }).click();
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
    await page.getByRole("button", { name: "サイズと配置", exact: true }).click();
    await expect(page.getByText("月タイトル")).toBeVisible();
    await expect(page.getByText("日付", { exact: true })).toBeVisible();
    await expect(page.getByText("曜日", { exact: true })).toBeVisible();
    await expect(page.getByText("セル余白")).toBeVisible();
    await expect(page.getByText("ヘッダー間隔")).toBeVisible();
    await expect(page.getByText("上余白")).toBeVisible();
  });
});
