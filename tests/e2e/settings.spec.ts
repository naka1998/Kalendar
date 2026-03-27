import { test, expect } from "./fixtures/global-setup";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("basic settings section header is visible", async ({ page }) => {
    await expect(page.getByText("基本設定")).toBeVisible();
  });

  test("can expand basic settings and see controls", async ({ page }) => {
    await page.getByText("基本設定").click();
    await expect(page.getByText("開始月")).toBeVisible();
    await expect(page.getByText("用紙")).toBeVisible();
  });

  test("can toggle paper orientation", async ({ page }) => {
    // Basic Settings is open by default
    await page.getByText("開始月").waitFor();
    const landscapeButton = page.getByRole("button", { name: "横" });
    await landscapeButton.click();
    await expect(landscapeButton).toBeVisible();
  });

  test("can toggle week start", async ({ page }) => {
    await page.getByText("週の開始").waitFor();
    const monButton = page.getByRole("button", { name: "月曜" });
    await monButton.click();
    await expect(monButton).toBeVisible();
  });

  test("accordion sections can be expanded", async ({ page }) => {
    await page.getByText("祝日").click();
    await expect(page.getByText("取得状態")).toBeVisible();

    await page.getByText("デザイン").click();
    await expect(page.getByText("テーマ")).toBeVisible();
  });

  test("action buttons are visible in sidebar", async ({ page }) => {
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByRole("button", { name: "HTMLから読込" })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "カレンダーをリセット" })).toBeVisible();
  });
});
