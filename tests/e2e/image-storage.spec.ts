/// <reference types="node" />

import { Buffer } from "node:buffer";
import { test, expect } from "./fixtures/global-setup";

test("auto-saves images above the localStorage limit and restores them after reload", async ({
  page,
}) => {
  await page.goto("/");
  const imageAreas = page.getByTestId("image-area");
  const saved = page.getByText(/自動保存済み/);

  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    const pixels = ctx.createImageData(canvas.width, canvas.height);
    let seed = 1;

    // Generate a PNG whose compressed size remains large enough to exercise the quota.
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      pixels.data[i] = seed & 255;
      pixels.data[i + 1] = (seed >>> 8) & 255;
      pixels.data[i + 2] = (seed >>> 16) & 255;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const buffer = Buffer.from(base64, "base64");
  const imageCount = 3;
  expect(buffer.length * imageCount).toBeGreaterThan(5 * 1024 * 1024);

  for (let i = 0; i < imageCount; i++) {
    const area = imageAreas.nth(i);
    const chooser = page.waitForEvent("filechooser");
    await area.getByText("クリックまたはドラッグで画像を追加").click();
    await (await chooser).setFiles({ name: `month-${i}.png`, mimeType: "image/png", buffer });
    await expect(area.locator("img")).toBeAttached();
    await expect(saved).toBeVisible();
  }
  await expect(page.getByRole("alert")).toHaveCount(0);

  await page.reload();

  await expect(imageAreas.locator("img")).toHaveCount(imageCount);
  for (let i = 0; i < imageCount; i++) {
    await expect(imageAreas.nth(i).locator("img")).toHaveJSProperty("naturalWidth", 1024);
  }
});
