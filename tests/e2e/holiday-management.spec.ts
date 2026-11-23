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

  test("lists holiday mark styles in a select", async ({ page }) => {
    await page.getByRole("button", { name: "基本設定", exact: true }).click();
    const mark = page.getByRole("combobox", { name: "祝日マーク" });
    await expect(mark.locator("option")).toHaveText([
      "ドット",
      "丸囲み",
      "下線",
      "色のみ",
      "祝日名",
    ]);
    await mark.selectOption("circle");
    await expect(mark).toHaveValue("circle");
    await mark.selectOption("underline");
    await expect(mark).toHaveValue("underline");
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

    await dateInput.fill("2027-12-25");
    await nameInput.fill("クリスマス");
    await sidebar.getByRole("button", { name: "追加", exact: true }).click();

    await expect(sidebar.getByText("2027-12-25 — クリスマス")).toBeVisible();
    await expect(sidebar.getByText("手動追加した祝日")).toBeVisible();
  });

  test("can remove a manually added holiday", async ({ page }) => {
    await page.getByText("データ").click();
    await page.getByText("取得状態").waitFor();
    const sidebar = page.getByRole("complementary");

    // First add a holiday
    await sidebar.locator('input[type="date"]').fill("2027-12-25");
    await sidebar.getByPlaceholder("名称").fill("クリスマス");
    await sidebar.getByRole("button", { name: "追加", exact: true }).click();
    await expect(sidebar.getByText("2027-12-25 — クリスマス")).toBeVisible();

    // Remove it
    await sidebar.getByText("×").first().click();
    await expect(sidebar.getByText("2027-12-25 — クリスマス")).not.toBeVisible();
  });
});
