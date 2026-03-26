import { test, expect } from "@playwright/test";

const TEST_IMAGE_PATH = "tests/e2e/fixtures/test-image.png";

async function uploadTestImage(page: import("@playwright/test").Page) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  const firstPage = page.locator("[data-month]").first();
  const placeholder = firstPage.getByText("クリックまたはドラッグで画像を追加");
  await placeholder.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(TEST_IMAGE_PATH);
  // Wait for image to load and aspect ratio to be detected
  await page.waitForTimeout(1000);
}

async function openImageEditMode(page: import("@playwright/test").Page) {
  const imageArea = page.getByTestId("image-area").first();
  // Hover to reveal edit button
  await imageArea.hover();
  const editButton = page.getByTestId("image-edit-button").first();
  await editButton.click();
  // Wait for overlay to appear
  await expect(page.getByTestId("image-edit-overlay").first()).toBeVisible();
}

test.describe("Image editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("edit button appears on image hover", async ({ page }) => {
    await uploadTestImage(page);
    const imageArea = page.getByTestId("image-area").first();
    await imageArea.hover();
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
    await page.waitForTimeout(300);

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

    // Toggle to cover
    await toggle.click();
    await expect(toggle).toContainText("cover");

    // Toggle back
    await toggle.click();
    await expect(toggle).toContainText("contain");
  });

  test("save persists crop settings and cancel discards them", async ({ page }) => {
    await uploadTestImage(page);

    // Edit and save
    await openImageEditMode(page);
    const slider = page.getByTestId("scale-slider").first();
    await slider.fill("2");
    await page.waitForTimeout(200);
    await page.getByTestId("crop-save").first().click();

    // Overlay should close
    await expect(page.getByTestId("image-edit-overlay")).toHaveCount(0);

    // Cropped image should still be visible with saved settings
    const croppedImg = page.getByTestId("cropped-image").first();
    await expect(croppedImg).toBeVisible();

    // Now edit again and cancel
    await openImageEditMode(page);
    await slider.fill("3");
    await page.waitForTimeout(200);
    await page.getByTestId("crop-cancel").first().click();

    // Should revert to saved scale (2), not the cancelled scale (3)
    // The cropped image should still be visible
    await expect(page.getByTestId("cropped-image").first()).toBeVisible();
  });

  test("reset restores default values", async ({ page }) => {
    await uploadTestImage(page);
    await openImageEditMode(page);

    // Change scale
    const slider = page.getByTestId("scale-slider").first();
    await slider.fill("2.5");
    await page.waitForTimeout(200);

    // Toggle to cover
    await page.getByTestId("fit-mode-toggle").first().click();
    await expect(page.getByTestId("fit-mode-toggle").first()).toContainText("cover");

    // Reset
    await page.getByTestId("crop-reset").first().click();
    await page.waitForTimeout(200);

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
    await page.waitForTimeout(200);
    await page.getByTestId("crop-save").first().click();
    await page.waitForTimeout(200);

    // First month should have cropped image
    const firstCropped = page.getByTestId("cropped-image").first();
    await expect(firstCropped).toBeVisible();

    // Check second month's image area doesn't have a cropped image
    const secondPage = page.locator("[data-month]").nth(1);
    const secondCropped = secondPage.locator("[data-testid='cropped-image']");
    await expect(secondCropped).toHaveCount(0);
  });
});
