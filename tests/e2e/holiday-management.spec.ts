import { test, expect } from "./fixtures/global-setup";

test.describe("Holiday Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows holiday fetch status", async ({ page }) => {
    // Expand data section (formerly "祝日")
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const status = page.locator("text=取得済み").or(page.locator("text=取得中..."));
    await expect(status.first()).toBeVisible();
  });

  test("holiday mark style options are visible", async ({ page }) => {
    // Holiday mark style is now in 基本設定 (open by default)
    await expect(page.getByRole("button", { name: "ドット" })).toBeVisible();
    await expect(page.getByRole("button", { name: "丸囲み" })).toBeVisible();
    await expect(page.getByRole("button", { name: "下線" })).toBeVisible();
    await expect(page.getByRole("button", { name: "色のみ" })).toBeVisible();
  });

  test("can switch holiday mark style", async ({ page }) => {
    // Holiday mark style is now in 基本設定 (open by default)
    // Click "丸囲み" and verify it gets the selected style
    const circleButton = page.getByRole("button", { name: "丸囲み" });
    await circleButton.click();

    // Selected button should have the active background class
    await expect(circleButton).toHaveClass(/bg-surface/);
    // The previously default "ドット" should lose the active class
    const dotButton = page.getByRole("button", { name: "ドット" });
    await expect(dotButton).not.toHaveClass(/bg-surface\b/);

    // Switch to "下線" and verify selection moves
    const underlineButton = page.getByRole("button", { name: "下線" });
    await underlineButton.click();
    await expect(underlineButton).toHaveClass(/bg-surface/);
    await expect(circleButton).not.toHaveClass(/bg-surface\b/);
  });

  test("add holiday form is visible", async ({ page }) => {
    // Expand data section
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByText("祝日を追加")).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "追加", exact: true })).toBeVisible();
  });

  test("add button is disabled when fields are empty", async ({ page }) => {
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByRole("button", { name: "追加", exact: true })).toBeDisabled();
  });

  test("can add a manual holiday", async ({ page }) => {
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const sidebar = page.getByRole("complementary");
    const dateInput = sidebar.locator('input[type="date"]');
    const nameInput = sidebar.getByPlaceholder("名称");

    await dateInput.fill("2026-12-25");
    await nameInput.fill("クリスマス");
    await sidebar.getByRole("button", { name: "追加", exact: true }).click();

    await expect(sidebar.getByText("2026-12-25 — クリスマス")).toBeVisible();
    await expect(sidebar.getByText("手動追加した祝日")).toBeVisible();
  });

  test("can remove a manually added holiday", async ({ page }) => {
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const sidebar = page.getByRole("complementary");

    // First add a holiday
    await sidebar.locator('input[type="date"]').fill("2026-12-25");
    await sidebar.getByPlaceholder("名称").fill("クリスマス");
    await sidebar.getByRole("button", { name: "追加", exact: true }).click();
    await expect(sidebar.getByText("2026-12-25 — クリスマス")).toBeVisible();

    // Remove it
    await sidebar.getByText("×").first().click();
    await expect(sidebar.getByText("2026-12-25 — クリスマス")).not.toBeVisible();
  });
});
