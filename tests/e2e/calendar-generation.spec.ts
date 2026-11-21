import { test, expect } from "./fixtures/global-setup";

test.describe("Calendar Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays app title", async ({ page }) => {
    await expect(page.getByText("Ethereal Calendar")).toBeVisible();
  });

  test("displays January through December 2027 by default", async ({ page }) => {
    const pages = page.locator("[data-month]");
    await expect(pages).toHaveCount(12);
    await expect(pages.first()).toHaveAttribute("data-month", "2027-01");
    await expect(pages.last()).toHaveAttribute("data-month", "2027-12");
  });

  test("displays month label in preview", async ({ page }) => {
    await expect(page.locator("[data-month='2027-01'] .font-heading").first()).toHaveText(
      "2027.01",
    );
  });

  test("displays weekday headers", async ({ page }) => {
    await expect(page.getByText("Sun").first()).toBeVisible();
    await expect(page.getByText("Mon").first()).toBeVisible();
  });

  test("month jump navigation exists", async ({ page }) => {
    const jumpButton = page.getByRole("button", { name: "01", exact: true });
    await expect(jumpButton).toBeVisible();
  });

  test("help button opens print guide modal", async ({ page }) => {
    await page.getByLabel("Help").click();
    await expect(page.getByText("ヘルプ")).toBeVisible();
    await page.getByText("ブラウザからPDF化する").click();
    await expect(page.getByText("Ctrl + P")).toBeVisible();
  });

  test("export button is visible in header", async ({ page }) => {
    await expect(page.getByRole("banner").getByRole("button", { name: "出力" })).toBeVisible();
  });
});
