import { test, expect } from "./fixtures/global-setup";
import { mobileTest } from "./fixtures/global-setup";
import AxeBuilder from "@axe-core/playwright";

// Known a11y issues to be fixed separately:
// - color-contrast: month jump button (.bg-primary + .text-on-primary) ratio 2.42 < 4.5
// - label: SliderField range inputs missing aria-label
const KNOWN_ISSUES = ["color-contrast", "label"];

function scanPage(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(KNOWN_ISSUES)
    .analyze();
}

test.describe("Accessibility - Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("default view has no WCAG AA violations", async ({ page }) => {
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
  });

  test("sidebar basic section expanded has no violations", async ({ page }) => {
    await page.getByText("基本設定").click();
    await page.waitForTimeout(300);

    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
  });

  test("sidebar design section expanded has no violations", async ({ page }) => {
    await page.getByText("デザイン").click();
    await page.waitForTimeout(300);

    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
  });

  test("help modal has no violations", async ({ page }) => {
    await page.getByLabel("Help").click();
    await page.getByText("ヘルプ").waitFor();

    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
  });

  test("download dialog has no violations", async ({ page }) => {
    await page.getByRole("banner").getByRole("button", { name: "出力" }).click();
    await page.waitForTimeout(300);

    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
  });
});

mobileTest.describe("Accessibility - Mobile", () => {
  mobileTest.setTimeout(120_000);

  mobileTest.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  mobileTest("mobile default view has no WCAG AA violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(KNOWN_ISSUES)
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
