import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("basic settings section header is visible", async ({ page }) => {
    await expect(page.getByText("Basic Settings")).toBeVisible();
  });

  test("can expand basic settings and see controls", async ({ page }) => {
    // Click to expand Basic Settings
    await page.getByText("Basic Settings").click();
    await expect(page.getByText("Start Date")).toBeVisible();
    await expect(page.getByText("Paper")).toBeVisible();
  });

  test("can toggle paper orientation", async ({ page }) => {
    await page.getByText("Basic Settings").click();
    await page.getByText("Start Date").waitFor();
    const landscapeButton = page.getByRole("button", { name: "Landscape" });
    await landscapeButton.click();
    await expect(landscapeButton).toBeVisible();
  });

  test("can toggle week start", async ({ page }) => {
    await page.getByText("Basic Settings").click();
    await page.getByText("Week Start").waitFor();
    const monButton = page.getByRole("button", { name: /^Mon$/ });
    await monButton.click();
    await expect(monButton).toBeVisible();
  });

  test("accordion sections can be expanded", async ({ page }) => {
    await page.getByText("Holidays").click();
    await expect(page.getByText("API Status")).toBeVisible();

    await page.getByText("Design").click();
    await expect(page.getByText("Theme")).toBeVisible();
  });

  test("export and import buttons are visible in sidebar", async ({ page }) => {
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByRole("button", { name: "Export" })).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Import" })).toBeVisible();
  });
});
