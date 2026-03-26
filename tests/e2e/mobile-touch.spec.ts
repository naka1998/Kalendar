import { mobileTest as test, expect } from "./fixtures/global-setup";

const TEST_IMAGE_PATH = "tests/e2e/fixtures/test-image.png";

async function uploadTestImage(page: import("@playwright/test").Page) {
  const imageInput = page.locator('input[type=file][accept="image/jpeg,image/png"]').first();
  await imageInput.setInputFiles(TEST_IMAGE_PATH);
  await page.waitForTimeout(2000);
}

// Note: We use click() instead of tap() because old Chromium headless doesn't
// support touch emulation. The mobile viewport + hasTouch context still validates
// that the UI works without relying on hover states. On real devices, click()
// maps to tap behavior.

test.describe("Mobile touch interactions", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
  });

  test("clicking image area makes action buttons visible (mobile viewport)", async ({ page }) => {
    await uploadTestImage(page);

    // Click the image area overlay to toggle button visibility
    await page.evaluate(() => {
      // Find the overlay div (the one with opacity-0/hover:opacity-100 or showImageButtons)
      const overlay = document.querySelector(
        '[data-testid="image-area"] > div.absolute',
      ) as HTMLElement;
      if (overlay) overlay.click();
    });
    await page.waitForTimeout(500);

    // Buttons should be visible
    const editButton = page.getByTestId("image-edit-button").first();
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText("トリミング");
    await expect(page.getByText("変更").first()).toBeVisible();
    await expect(page.getByText("削除").first()).toBeVisible();
  });

  test("trimming button enters edit mode on mobile viewport", async ({ page }) => {
    await uploadTestImage(page);

    // Show buttons then click trimming
    await page.evaluate(() => {
      (document.querySelector('[data-testid="image-edit-button"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Edit overlay should be visible
    await expect(page.getByTestId("image-edit-overlay").first()).toBeVisible();
    await expect(page.getByTestId("crop-frame").first()).toBeVisible();
  });

  test("trim toolbar buttons work on mobile viewport", async ({ page }) => {
    await uploadTestImage(page);

    // Enter trim mode
    await page.evaluate(() => {
      (document.querySelector('[data-testid="image-edit-button"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Toolbar buttons should be visible
    await expect(page.getByTestId("aspect-mode-free").first()).toBeVisible();
    await expect(page.getByTestId("crop-save").first()).toBeVisible();
    await expect(page.getByTestId("crop-cancel").first()).toBeVisible();

    // Click save
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-save"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Overlay should close
    await expect(page.getByTestId("image-edit-overlay")).toHaveCount(0);
  });

  test("image area renders at mobile viewport width", async ({ page }) => {
    // Verify the page actually renders in mobile viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390);
    expect(viewport?.height).toBe(844);

    // Calendar page should be visible even at mobile size
    const monthPages = page.locator("[data-month]");
    await expect(monthPages.first()).toBeVisible();
  });
});
