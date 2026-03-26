import { test, expect } from "./fixtures/global-setup";

const TEST_WIDE_IMAGE = "tests/e2e/fixtures/test-wide-image.png";

test.describe("Image alignment", () => {
  // Image upload + accordion interaction need more time on slow browsers
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(5000);
    // Upload image
    const imageInput = page.locator('input[type=file][accept="image/jpeg,image/png"]').first();
    await imageInput.setInputFiles(TEST_WIDE_IMAGE);
    await page.waitForTimeout(3000);
    // Open design accordion
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent?.trim() === "デザイン",
      );
      if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await page.waitForTimeout(2000);
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

  test("switching alignment visually moves the image", async ({ page }) => {
    const imageArea = page.getByTestId("image-area").first();
    await clickAlignButton(page, "上揃え");
    const screenshotTop = await imageArea.screenshot();
    await clickAlignButton(page, "下揃え");
    const screenshotBottom = await imageArea.screenshot();
    expect(screenshotTop.equals(screenshotBottom)).toBe(false);
  });
});

async function clickAlignButton(page: import("@playwright/test").Page, label: string) {
  // Find the button inside the 画像揃え section and simulate click
  await page.evaluate((targetLabel) => {
    // Find 画像揃え label, then the buttons within its parent
    const labels = Array.from(document.querySelectorAll("label"));
    const sectionLabel = labels.find((l) => l.textContent?.includes("画像揃え"));
    if (!sectionLabel) return;
    const section = sectionLabel.closest(".space-y-1\\.5") ?? sectionLabel.parentElement;
    if (!section) return;
    const btn = Array.from(section.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === targetLabel,
    );
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const opts: MouseEventInit = {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      button: 0,
    };
    btn.dispatchEvent(new PointerEvent("pointerdown", opts));
    btn.dispatchEvent(new MouseEvent("mousedown", opts));
    btn.dispatchEvent(new PointerEvent("pointerup", opts));
    btn.dispatchEvent(new MouseEvent("mouseup", opts));
    btn.dispatchEvent(new MouseEvent("click", opts));
  }, label);
  await page.waitForTimeout(1000);
}

async function getObjectPosition(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => {
    const img = document.querySelector('[data-testid="image-area"] img') as HTMLElement | null;
    if (!img) return "none";
    return img.style.objectPosition || getComputedStyle(img).objectPosition;
  });
}
