import { readFile } from "node:fs/promises";
import JSZip from "jszip";
import { test, mobileTest, expect } from "./fixtures/global-setup";

test("lays out a photo caption and round-trips it through all output paths", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    window.print = () => {};
  });
  await page.goto("/");

  const image = page.getByTestId("image-area").first();
  await image.locator('input[type="file"]').setInputFiles("tests/e2e/fixtures/test-wide-image.png");
  await expect(image.locator("img")).toBeVisible();
  await image.hover();
  await image.getByRole("button", { name: "キャプション", exact: true }).click();

  const title = "写真 <1> & 春";
  const body = "春の写真を飾るための、右側に置くキャプションの本文です。\n撮影メモ";
  const dialog = page.getByRole("dialog", { name: "画像のキャプション" });
  await dialog.getByLabel("タイトル").fill(title);
  await dialog.getByLabel("本文").fill(body);
  await dialog.getByRole("button", { name: "保存", exact: true }).click();

  const caption = page.locator(".calendar-image-caption");
  const month = page.getByTestId("month-title").first();
  await expect(caption.locator(".calendar-image-caption-title")).toHaveText(title);
  await expect(caption.locator(".calendar-image-caption-body")).toHaveJSProperty(
    "textContent",
    body,
  );
  await expect(caption.locator(".calendar-image-caption-title")).toHaveCSS("font-size", "20px");
  await expect(caption.locator(".calendar-image-caption-body")).toHaveCSS("font-size", "14px");

  const photoBox = (await image.boundingBox())!;
  const captionBox = (await caption.boundingBox())!;
  const monthBox = (await month.boundingBox())!;
  expect(captionBox.y).toBeGreaterThanOrEqual(photoBox.y + photoBox.height);
  expect(captionBox.x).toBeGreaterThanOrEqual(monthBox.x + monthBox.width);
  expect(captionBox.y).toBeLessThan(monthBox.y + monthBox.height);

  await expect(page.getByText(/自動保存済み/)).toBeVisible();
  await page.reload();
  await expect(caption.locator(".calendar-image-caption-title")).toHaveText(title);

  await page.getByRole("button", { name: "サイズと配置", exact: true }).click();
  await page
    .getByText("日付欄の幅", { exact: true })
    .locator("..")
    .getByRole("slider")
    .press("Home");
  const narrowMonth = (await month.boundingBox())!;
  expect((await caption.boundingBox())!.y).toBeGreaterThanOrEqual(
    narrowMonth.y + narrowMonth.height,
  );

  const output = page.getByRole("button", { name: "出力", exact: true });
  await output.click();
  const printed = page.waitForEvent("popup");
  await page.getByRole("button", { name: /^PDF/ }).click();
  const printPage = await printed;
  await printPage.emulateMedia({ media: "print" });
  const printedCaption = printPage.locator(".calendar-image-caption");
  await expect(printedCaption.locator(".calendar-image-caption-title")).toHaveText(title);
  const printedMonth = (await printPage.locator(".calendar-title").first().boundingBox())!;
  expect((await printedCaption.boundingBox())!.y).toBeGreaterThanOrEqual(
    printedMonth.y + printedMonth.height,
  );
  await printPage.close();

  await output.click();
  const htmlDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /^HTML/ }).click();
  const htmlPath = (await (await htmlDownload).path())!;
  const html = await readFile(htmlPath, "utf8");
  expect(html).toContain("写真 &lt;1&gt; &amp; 春");

  await output.click();
  const zipDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /^ZIP/ }).click();
  const zipPath = (await (await zipDownload).path())!;
  const zip = await JSZip.loadAsync(await readFile(zipPath));
  const zippedHtml = await zip.file("index.html")!.async("string");
  expect(zippedHtml).toContain("写真 &lt;1&gt; &amp; 春");
  expect(zippedHtml).toContain(body);

  await image.hover();
  await image.getByRole("button", { name: "キャプション", exact: true }).click();
  await dialog.getByRole("button", { name: "キャプションを削除", exact: true }).click();
  await expect(caption).toHaveCount(0);

  await page.getByRole("button", { name: "データ", exact: true }).click();
  await page.locator('input[accept=".html,.htm"]').setInputFiles(htmlPath);
  await expect(caption.locator(".calendar-image-caption-title")).toHaveText(title);
  await image.hover();
  await image.getByRole("button", { name: "キャプション", exact: true }).click();
  await expect(dialog.getByLabel("タイトル")).toHaveValue(title);
  await expect(dialog.getByLabel("本文")).toHaveValue(body);
});

mobileTest("edits a body-only caption with touch controls", async ({ page }) => {
  await page.goto("/");
  const image = page.getByTestId("image-area").first();
  await image.locator('input[type="file"]').setInputFiles("tests/e2e/fixtures/test-image.png");
  await expect(image.locator("img")).toBeVisible();
  await image.tap({ position: { x: 12, y: 12 } });
  await image.getByRole("button", { name: "キャプション", exact: true }).tap();

  const dialog = page.getByRole("dialog", { name: "画像のキャプション" });
  await dialog.getByLabel("本文").fill("撮影メモ");
  await dialog.getByRole("button", { name: "保存", exact: true }).tap();
  await expect(page.locator(".calendar-image-caption-body")).toHaveText("撮影メモ");
  await expect(page.locator(".calendar-image-caption-title")).toHaveCount(0);
});
