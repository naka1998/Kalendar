import { test, expect } from "./fixtures/global-setup";

const TEST_WIDE_IMAGE = "tests/e2e/fixtures/test-wide-image.png";

test.describe("Image alignment", () => {
  // Image upload + interaction need more time on slow browsers
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(5000);
    // Upload image
    const imageInput = page.locator('input[type=file][accept="image/jpeg,image/png"]').first();
    await imageInput.setInputFiles(TEST_WIDE_IMAGE);
    await page.waitForTimeout(3000);
    await page.getByRole("button", { name: "サイズと配置", exact: true }).click();
  });

  test("image align top sets object-position to top", async ({ page }) => {
    await clickAlignButton(page, "上揃え");
    const pos = await getObjectPosition(page);
    expect(pos).toContain("top");
  });

  test("image align center keeps object-position at center", async ({ page }) => {
    const pos = await getObjectPosition(page);
    expect(pos === "center" || pos === "center center" || pos.includes("50%")).toBe(true);
  });

  test("image align bottom sets object-position to bottom", async ({ page }) => {
    await clickAlignButton(page, "下揃え");
    const pos = await getObjectPosition(page);
    expect(pos).toContain("bottom");
  });

  test.fixme("switching alignment visually moves the image", async ({ page }) => {
    const imageArea = page.getByTestId("image-area").first();
    await clickAlignButton(page, "上揃え");
    const screenshotTop = await imageArea.screenshot();
    await clickAlignButton(page, "下揃え");
    const screenshotBottom = await imageArea.screenshot();
    expect(screenshotTop.equals(screenshotBottom)).toBe(false);
  });
});

async function clickAlignButton(page: import("@playwright/test").Page, label: string) {
  await page
    .getByRole("group", { name: "画像配置", exact: true })
    .getByRole("button", { name: label, exact: true })
    .click();
}

async function getObjectPosition(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const img = document.querySelector('[data-testid="image-area"] img') as HTMLElement | null;
    if (!img) return "none";
    return img.style.objectPosition || getComputedStyle(img).objectPosition;
  });
}
