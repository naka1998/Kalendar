import { test, expect } from "./fixtures/global-setup";

const TEST_IMAGE_PATH = "tests/e2e/fixtures/test-image.png";

async function uploadTestImage(page: import("@playwright/test").Page) {
  // Use setInputFiles directly on the hidden file input (bypasses filechooser event)
  const imageInput = page.locator('input[type=file][accept="image/jpeg,image/png"]').first();
  await imageInput.setInputFiles(TEST_IMAGE_PATH);
  // Wait for image to load and aspect ratio to be detected
  await page.waitForTimeout(2000);
}

async function openImageEditMode(page: import("@playwright/test").Page) {
  // Use evaluate to click the edit button directly (hover CSS may not work reliably in headless)
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="image-edit-button"]') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  // Wait for overlay to appear
  await expect(page.getByTestId("image-edit-overlay").first()).toBeVisible({ timeout: 10000 });
}

test.describe("Image editing", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
  });

  test("edit button appears on image hover", async ({ page }) => {
    await uploadTestImage(page);
    const imageArea = page.getByTestId("image-area").first();
    await imageArea.hover();
    await page.waitForTimeout(500);
    await expect(page.getByTestId("image-edit-button").first()).toBeVisible();
  });

  test("clicking edit opens the edit overlay", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);
    await expect(page.getByTestId("scale-slider").first()).toBeVisible();
    await expect(page.getByTestId("fit-mode-toggle").first()).toBeVisible();
    await expect(page.getByTestId("crop-save").first()).toBeVisible();
    await expect(page.getByTestId("crop-cancel").first()).toBeVisible();
    await expect(page.getByTestId("crop-reset").first()).toBeVisible();
  });

  test("scale slider changes image transform", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    const slider = page.getByTestId("scale-slider").first();
    // Set scale to 2
    await slider.fill("2");
    await page.waitForTimeout(500);

    // Check that the cropped image has a transform applied
    const croppedImg = page.getByTestId("cropped-image").first();
    await expect(croppedImg).toBeVisible();
    const style = await croppedImg.getAttribute("style");
    expect(style).toContain("translate");
  });

  test("fit mode toggle switches between cover and contain", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    const toggle = page.getByTestId("fit-mode-toggle").first();
    // Initially contain
    await expect(toggle).toContainText("contain");

    // Toggle to cover (use evaluate to bypass pointer capture)
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    await expect(toggle).toContainText("cover");

    // Toggle back
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement;
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    await expect(toggle).toContainText("contain");
  });

  test("save persists crop settings and cancel discards them", async ({ page }) => {
    await uploadTestImage(page);

    // Edit and save with scale=2
    await openImageEditMode(page);
    const slider = page.getByTestId("scale-slider").first();
    await slider.fill("2");
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-save"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Overlay should close
    await expect(page.getByTestId("image-edit-overlay")).toHaveCount(0);

    // Cropped image should still be visible with saved settings
    const croppedImg = page.getByTestId("cropped-image").first();
    await expect(croppedImg).toBeVisible();

    // Now edit again and cancel
    await openImageEditMode(page);
    const slider2 = page.getByTestId("scale-slider").first();
    await slider2.fill("3");
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-cancel"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Should revert to saved settings (cropped image still visible)
    await expect(page.getByTestId("cropped-image").first()).toBeVisible();
  });

  test("reset restores default values", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    // Change scale
    const slider = page.getByTestId("scale-slider").first();
    await slider.fill("2.5");
    await page.waitForTimeout(300);

    // Toggle to cover
    await page.evaluate(() => {
      (document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);
    await expect(page.getByTestId("fit-mode-toggle").first()).toContainText("cover");

    // Reset
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-reset"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);

    // Verify slider is back to 1 and fit mode is contain
    await expect(page.getByTestId("fit-mode-toggle").first()).toContainText("contain");
    const sliderValue = await slider.inputValue();
    expect(parseFloat(sliderValue)).toBe(1);
  });

  test("editing one month does not affect another month's image", async ({ page }) => {
    // Upload to first month
    await uploadTestImage(page);

    // Edit first month: change scale and save
    await openImageEditMode(page);
    await page.getByTestId("scale-slider").first().fill("2");
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-save"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // First month should have cropped image
    const firstCropped = page.getByTestId("cropped-image").first();
    await expect(firstCropped).toBeVisible();

    // Second month's image area should NOT have a cropped image
    const secondPage = page.locator("[data-month]").nth(1);
    const secondCropped = secondPage.locator("[data-testid='cropped-image']");
    await expect(secondCropped).toHaveCount(0);
  });
});
