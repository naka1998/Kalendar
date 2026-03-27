import { test, expect } from "./fixtures/global-setup";

test.describe("Design Customization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Expand appearance section (formerly "デザイン")
    await page.getByText("見た目").click();
    await page.getByText("テーマ").waitFor();
  });

  test("theme grid shows available themes", async ({ page }) => {
    // Theme grid should have multiple theme options
    const themeButtons = page.locator(".grid-cols-3 button");
    const count = await themeButtons.count();
    expect(count).toBeGreaterThan(1);
  });

  test("can switch theme and see background color change", async ({ page }) => {
    // Get the initial page background color
    const pageOuter = page.locator('[data-testid="page-container"]').first().locator("..");
    const initialBg = await pageOuter.evaluate((el) => el.style.background);

    // Remember which theme button is initially selected (has ring-2 class)
    const themeButtons = page.locator(".grid-cols-3 button");
    const firstSelected = await themeButtons.evaluateAll((buttons) =>
      buttons.findIndex((b) => b.className.includes("ring-2")),
    );

    // Click a theme with a distinct background color (index 2 = "Dark" with #1F2937)
    // This ensures the background actually changes from the default white themes
    const targetIndex = firstSelected === 2 ? 3 : 2;
    await themeButtons.nth(targetIndex).click();

    // The clicked theme button should now have the selected ring
    await expect(themeButtons.nth(targetIndex)).toHaveClass(/ring-2/);

    // The previously selected button should no longer have the ring
    if (firstSelected >= 0) {
      await expect(themeButtons.nth(firstSelected)).not.toHaveClass(/ring-2/);
    }

    // Background color should actually change
    const newBg = await pageOuter.evaluate((el) => el.style.background);
    expect(newBg).not.toBe(initialBg);
  });

  test("font weight buttons work", async ({ page }) => {
    const boldButton = page.getByRole("button", { name: "太字" });
    await boldButton.click();
    await expect(boldButton).toBeVisible();
  });

  test("image toggle can be clicked", async ({ page }) => {
    // Image toggle is now in 基本設定 section
    await page.getByText("基本設定").click();
    await page.getByText("開始月").waitFor();

    const toggleLabel = page.getByText("画像を使用");
    await expect(toggleLabel).toBeVisible();

    // Find and click the toggle button next to the label
    const toggleContainer = toggleLabel.locator("..");
    const toggle = toggleContainer.locator("button");
    await toggle.click();

    // After toggling off, image areas should disappear
    await expect(page.getByTestId("image-area").first()).not.toBeVisible();
  });

  test("re-enabling images shows image areas", async ({ page }) => {
    // Image toggle is now in 基本設定 section
    await page.getByText("基本設定").click();
    await page.getByText("開始月").waitFor();

    const toggleContainer = page.getByText("画像を使用").locator("..");
    const toggle = toggleContainer.locator("button");

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
    await expect(page.getByText("月タイトル")).toBeVisible();
    await expect(page.getByText("日付")).toBeVisible();
    await expect(page.getByText("曜日", { exact: true })).toBeVisible();
    await expect(page.getByText("セル余白")).toBeVisible();
    await expect(page.getByText("ヘッダー間隔")).toBeVisible();
    await expect(page.getByText("上余白")).toBeVisible();
  });
});
