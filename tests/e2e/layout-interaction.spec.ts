import { test, expect } from "@playwright/test";
import path from "path";

// Helper: upload a test image to the first month's image area
async function uploadTestImage(page: import("@playwright/test").Page) {
  // Create a minimal 1x1 PNG file for testing
  const fileChooserPromise = page.waitForEvent("filechooser");

  // Click the image placeholder area of the first calendar page
  const firstPage = page.locator("[data-month]").first();
  const placeholder = firstPage.getByText("クリックまたはドラッグで画像を追加");
  await placeholder.click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.resolve(__dirname, "fixtures/test-image.png"));
}

test.describe("Layout interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("divider handle is visible when image is present", async ({ page }) => {
    await uploadTestImage(page);

    const divider = page.getByTestId("divider-handle").first();
    await expect(divider).toBeVisible();
  });

  test("divider handle is hidden when no image", async ({ page }) => {
    // By default no images are uploaded, so divider should not exist
    const divider = page.getByTestId("divider-handle");
    await expect(divider).toHaveCount(0);
  });

  test("dragging divider vertically changes image/calendar ratio", async ({ page }) => {
    await uploadTestImage(page);

    const imageArea = page.getByTestId("image-area").first();
    const initialHeight = await imageArea.evaluate((el) => el.getBoundingClientRect().height);

    // Drag divider downward by 50px
    const divider = page.getByTestId("divider-handle").first();
    const dividerBox = await divider.boundingBox();
    if (!dividerBox) throw new Error("Divider not found");

    await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2 + 50, { steps: 5 });
    await page.mouse.up();

    const newHeight = await imageArea.evaluate((el) => el.getBoundingClientRect().height);
    expect(newHeight).toBeGreaterThan(initialHeight);
  });

  test("position toggle cycles through layout positions", async ({ page }) => {
    await uploadTestImage(page);

    const toggle = page.getByTestId("position-toggle").first();
    await expect(toggle).toBeVisible();

    const container = page.getByTestId("page-container").first();

    // Initial: top (flex-col)
    const initialDirection = await container.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(initialDirection).toBe("column");

    // Click 1: top → right (flex-row)
    await toggle.click();
    const direction2 = await container.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction2).toBe("row");

    // Click 2: right → bottom (flex-col-reverse)
    await toggle.click();
    const direction3 = await container.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction3).toBe("column-reverse");

    // Click 3: bottom → left (flex-row-reverse)
    await toggle.click();
    const direction4 = await container.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(direction4).toBe("row-reverse");
  });

  test("dragging divider in horizontal layout changes width ratio", async ({ page }) => {
    await uploadTestImage(page);

    // Switch to horizontal layout (right)
    const toggle = page.getByTestId("position-toggle").first();
    await toggle.click();

    const imageArea = page.getByTestId("image-area").first();
    const initialWidth = await imageArea.evaluate((el) => el.getBoundingClientRect().width);

    // Drag divider rightward by 50px
    const divider = page.getByTestId("divider-handle").first();
    const dividerBox = await divider.boundingBox();
    if (!dividerBox) throw new Error("Divider not found");

    await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(dividerBox.x + dividerBox.width / 2 + 50, dividerBox.y + dividerBox.height / 2, { steps: 5 });
    await page.mouse.up();

    const newWidth = await imageArea.evaluate((el) => el.getBoundingClientRect().width);
    expect(newWidth).toBeGreaterThan(initialWidth);
  });

  test("image ratio preset buttons are removed from sidebar", async ({ page }) => {
    // Expand design section
    await page.getByText("デザイン").click();

    // The old preset buttons (60:40, 50:50, 70:30) should not exist
    await expect(page.getByRole("button", { name: "60:40" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "50:50" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "70:30" })).toHaveCount(0);
  });
});
