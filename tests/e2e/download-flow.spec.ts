import { test, expect } from "@playwright/test";

test.describe("Download Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("export button opens dropdown menu", async ({ page }) => {
    await page.getByRole("button", { name: "出力" }).click();
    // Use role-based selectors to avoid strict mode violations
    const dropdown = page.locator(".glass-panel");
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator("text=PDF").first()).toBeVisible();
    await expect(dropdown.locator("text=ZIP").first()).toBeVisible();
  });

  test("dropdown shows export descriptions", async ({ page }) => {
    await page.getByRole("button", { name: "出力" }).click();
    await expect(page.getByText("印刷ダイアログからPDF保存")).toBeVisible();
    await expect(page.getByText("単一HTMLファイル（画像埋め込み）")).toBeVisible();
  });

  test("HTML export triggers download", async ({ page }) => {
    await page.getByRole("button", { name: "出力" }).click();

    const downloadPromise = page.waitForEvent("download");
    // Click the button containing "HTML" label but not the sidebar "HTMLから読込"
    const dropdown = page.locator(".glass-panel");
    await dropdown.locator("text=HTML").first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("calendar.html");
  });

  test("ZIP export triggers download", async ({ page }) => {
    await page.getByRole("button", { name: "出力" }).click();

    const downloadPromise = page.waitForEvent("download");
    const dropdown = page.locator(".glass-panel");
    await dropdown.locator("text=ZIP").first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("calendar.zip");
  });

  test("temp save button works", async ({ page }) => {
    await page.getByRole("button", { name: "一時保存" }).click();
    await expect(page.getByText("保存しました")).toBeVisible();
    await expect(page.getByRole("button", { name: "復元" })).toBeVisible();
  });
});
