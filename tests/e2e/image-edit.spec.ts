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

  test("edit button appears on image hover", async ({ page }) => {
    await uploadTestImage(page);
    const imageArea = page.getByTestId("image-area").first();
    await imageArea.hover();
    await page.waitForTimeout(500);
    await expect(page.getByTestId("image-edit-button").first()).toBeVisible();
  });

  test("clicking edit opens the edit overlay with crop frame", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);
    await expect(page.getByTestId("crop-frame").first()).toBeVisible();
    await expect(page.getByTestId("fit-mode-toggle").first()).toBeVisible();
    await expect(page.getByTestId("crop-save").first()).toBeVisible();
    await expect(page.getByTestId("crop-cancel").first()).toBeVisible();
    await expect(page.getByTestId("crop-reset").first()).toBeVisible();
  });

  test("fit mode toggle shows Japanese labels", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    const toggle = page.getByTestId("fit-mode-toggle").first();
    // Default is cover = 短辺に合わせる
    await expect(toggle).toContainText("短辺に合わせる");

    // Toggle to contain
    await page.evaluate(() => {
      (document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);
    await expect(toggle).toContainText("長辺に合わせる");

    // Toggle back
    await page.evaluate(() => {
      (document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);
    await expect(toggle).toContainText("短辺に合わせる");
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

    // Cropped image should be visible with saved settings
    const croppedImg = page.getByTestId("cropped-image").first();
    await expect(croppedImg).toBeVisible();

    // Now edit again and cancel
    await openImageEditMode(page);
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

    // Toggle to contain
    await page.evaluate(() => {
      (document.querySelector('[data-testid="fit-mode-toggle"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);
    await expect(page.getByTestId("fit-mode-toggle").first()).toContainText("長辺に合わせる");

    // Reset
    await page.evaluate(() => {
      (document.querySelector('[data-testid="crop-reset"]') as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(300);

    // Should be back to cover (短辺に合わせる)
    await expect(page.getByTestId("fit-mode-toggle").first()).toContainText("短辺に合わせる");
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

    // First month should have cropped image
    await expect(page.getByTestId("cropped-image").first()).toBeVisible();

    // Second month should NOT have a cropped image
    const secondPage = page.locator("[data-month]").nth(1);
    const secondCropped = secondPage.locator("[data-testid='cropped-image']");
    await expect(secondCropped).toHaveCount(0);
  });
});
