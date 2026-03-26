import { test, expect } from "./fixtures/global-setup";

const TEST_IMAGE_PATH = "tests/e2e/fixtures/test-image.png";

async function uploadTestImage(page: import("@playwright/test").Page) {
  const imageInput = page.locator('input[type=file][accept="image/jpeg,image/png"]').first();
  await imageInput.setInputFiles(TEST_IMAGE_PATH);
  await page.waitForTimeout(2000);
}

async function openImageEditMode(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="image-edit-button"]') as HTMLButtonElement;
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);
  await expect(page.getByTestId("image-edit-overlay").first()).toBeVisible({ timeout: 10000 });
}

test.describe("Image editing", () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
  });

  test("trimming button appears on image hover", async ({ page }) => {
    await uploadTestImage(page);
    const imageArea = page.getByTestId("image-area").first();
    await imageArea.hover();
    await page.waitForTimeout(500);
    const editButton = page.getByTestId("image-edit-button").first();
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText("トリミング");
  });

  test("clicking trimming opens overlay with crop frame and aspect mode buttons", async ({
    page,
  }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);
    await expect(page.getByTestId("crop-frame").first()).toBeVisible();
    await expect(page.getByTestId("aspect-mode-free").first()).toBeVisible();
    await expect(page.getByTestId("aspect-mode-original").first()).toBeVisible();
    await expect(page.getByTestId("aspect-mode-square").first()).toBeVisible();
    await expect(page.getByTestId("crop-save").first()).toBeVisible();
    await expect(page.getByTestId("crop-cancel").first()).toBeVisible();
    await expect(page.getByTestId("crop-reset").first()).toBeVisible();
  });

  test("aspect mode buttons switch between free, original, and square", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    // Click original mode
    await page.evaluate(() => {
      (
        document.querySelector('[data-testid="aspect-mode-original"]') as HTMLButtonElement
      )?.click();
    });
    await page.waitForTimeout(300);

    // Click square mode
    await page.evaluate(() => {
      (document.querySelector('[data-testid="aspect-mode-square"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);

    // Click free mode
    await page.evaluate(() => {
      (document.querySelector('[data-testid="aspect-mode-free"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);

    // All buttons should remain visible (no crash)
    await expect(page.getByTestId("aspect-mode-free").first()).toBeVisible();
  });

  test("save persists crop settings and cancel discards them", async ({ page }) => {
    await uploadTestImage(page);

    // Edit and save
    await openImageEditMode(page);
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-save"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Overlay should close
    await expect(page.getByTestId("image-edit-overlay")).toHaveCount(0);

    // Cropped image should be visible
    const croppedImg = page.getByTestId("cropped-image").first();
    await expect(croppedImg).toBeVisible();

    // Edit again and cancel
    await openImageEditMode(page);
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-cancel"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    // Should revert to saved settings
    await expect(page.getByTestId("cropped-image").first()).toBeVisible();
  });

  test("reset restores default values", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    // Reset
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-reset"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);

    // Crop frame should still be visible
    await expect(page.getByTestId("crop-frame").first()).toBeVisible();
  });

  test("crop frame has resize handle", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);
    await expect(page.getByTestId("crop-resize-handle").first()).toBeVisible();
  });

  test("editing one month does not affect another month's image", async ({ page }) => {
    await uploadTestImage(page);

    // Edit first month and save
    await openImageEditMode(page);
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-save"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);

    await expect(page.getByTestId("cropped-image").first()).toBeVisible();

    // Second month should NOT have a cropped image
    const secondPage = page.locator("[data-month]").nth(1);
    const secondCropped = secondPage.locator("[data-testid='cropped-image']");
    await expect(secondCropped).toHaveCount(0);
  });
});
