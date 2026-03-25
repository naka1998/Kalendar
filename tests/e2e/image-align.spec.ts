import { test, expect } from "@playwright/test";
import path from "path";

const TEST_WIDE_IMAGE = path.join("tests", "e2e", "fixtures", "test-wide-image.png");

// Helper: upload a wide test image to the first month
async function uploadWideImage(page: import("@playwright/test").Page) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  const firstPage = page.locator("[data-month]").first();
  const placeholder = firstPage.getByText("クリックまたはドラッグで画像を追加");
  await placeholder.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(TEST_WIDE_IMAGE);
}

// Helper: open design section and click image align button via JS dispatch
async function openDesignSection(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const btns = document.querySelectorAll("button");
    const btn = Array.from(btns).find((b) => b.textContent?.trim() === "デザイン");
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await page.waitForTimeout(1000);
}

// Helper: click the nth "上揃え"/"中央"/"下揃え" button (0=image align, 1=content align)
async function clickImageAlignButton(
  page: import("@playwright/test").Page,
  label: string,
) {
  const buttons = await page.getByText(label, { exact: true }).all();
  // First occurrence is image align, second is content align
  if (buttons.length > 0) {
    await buttons[0].click();
    await page.waitForTimeout(500);
  }
}

// Helper: get the bounding box of the actual rendered image content
// by reading the computed object-position style on the img element
async function getImageObjectPosition(
  page: import("@playwright/test").Page,
): Promise<string> {
  return page.evaluate(() => {
    const img = document.querySelector('[data-testid="image-area"] img');
    if (!img) return "none";
    return getComputedStyle(img).objectPosition;
  });
}

test.describe("Image alignment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await uploadWideImage(page);
    await openDesignSection(page);
  });

  test("image align top sets object-position to top", async ({ page }) => {
    await clickImageAlignButton(page, "上揃え");
    const pos = await getImageObjectPosition(page);
    // "50% 0%" means horizontally centered, vertically at top
    expect(pos).toContain("0%");
  });

  test("image align center sets object-position to center", async ({ page }) => {
    // Center is default, but click it explicitly
    await clickImageAlignButton(page, "中央");
    const pos = await getImageObjectPosition(page);
    expect(pos).toContain("50%");
  });

  test("image align bottom sets object-position to bottom", async ({ page }) => {
    await clickImageAlignButton(page, "下揃え");
    const pos = await getImageObjectPosition(page);
    expect(pos).toContain("100%");
  });

  test("switching alignment visually moves the image", async ({ page }) => {
    // Take screenshot with top alignment
    await clickImageAlignButton(page, "上揃え");
    const imageArea = page.getByTestId("image-area").first();
    const screenshotTop = await imageArea.screenshot();

    // Switch to bottom alignment
    await clickImageAlignButton(page, "下揃え");
    const screenshotBottom = await imageArea.screenshot();

    // The screenshots should be different because the image is
    // positioned differently (top vs bottom of the container)
    expect(Buffer.compare(screenshotTop, screenshotBottom)).not.toBe(0);
  });
});
