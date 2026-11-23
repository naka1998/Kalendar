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

  test("selecting a theme updates the calendar page and month title colors", async ({ page }) => {
    await openAppearance(page);
    const pageOuter = page.getByTestId("page-container").first().locator("..");
    const monthTitle = page.getByTestId("month-title").first();
    const calendarDays = pageOuter.locator(".calendar-cell:not([data-empty]) .calendar-day-number");
    const originalDays = await calendarDays.allTextContents();
    const expectedColors = {
      Classic: ["255, 255, 255", "17, 24, 39"],
      Monochrome: ["255, 255, 255", "55, 65, 81"],
      Slate: ["255, 255, 255", "30, 58, 95"],
      Sepia: ["255, 255, 255", "120, 53, 15"],
      Forest: ["255, 255, 255", "20, 83, 45"],
      Editorial: ["246, 240, 228", "32, 45, 68"],
      Botanical: ["232, 239, 223", "47, 81, 62"],
      Blueprint: ["17, 46, 76", "218, 246, 255"],
      Risograph: ["255, 242, 214", "36, 57, 112"],
      Clay: ["243, 219, 203", "102, 56, 44"],
      "Retro Terminal": ["23, 35, 28", "255, 208, 130"],
      "Pop Grid": ["251, 247, 235", "33, 74, 196"],
      Dusk: ["48, 44, 85", "255, 244, 255"],
    };

    await expect(page.getByRole("button", { name: "Minimal", exact: true })).toHaveCount(0);
    for (const [theme, [background, title]] of Object.entries(expectedColors)) {
      const button = page.getByRole("button", { name: theme, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(pageOuter).toHaveCSS("background-color", `rgb(${background})`);
      await expect(monthTitle).toHaveCSS("color", `rgb(${title})`);
      await expect(calendarDays).toHaveText(originalDays);
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
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    const toggle = page.getByRole("button", { name: "画像を使用", exact: true });
    await expect(page.getByTestId("image-area").first()).toBeVisible();
    await toggle.click();

    // After toggling off, image areas should disappear
    await expect(page.getByTestId("image-area").first()).not.toBeVisible();
  });

  test("re-enabling images shows image areas", async ({ page }) => {
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    const toggle = page.getByRole("button", { name: "画像を使用", exact: true });

    // Toggle off
    await toggle.click();
    await expect(page.getByTestId("image-area").first()).not.toBeVisible();

    // Toggle on
    await toggle.click();
    await expect(page.getByTestId("image-area").first()).toBeVisible();
  });

  test("content alignment buttons work", async ({ page }) => {
    await page.getByRole("button", { name: "サイズと配置", exact: true }).click();
    const placement = page.getByRole("group", { name: "カレンダー配置" });
    const centerButton = placement.getByRole("button", { name: "中央", exact: true }).first();
    await centerButton.click();
    await expect(centerButton).toBeVisible();

    const bottomButton = placement.getByRole("button", { name: "下揃え", exact: true });
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
