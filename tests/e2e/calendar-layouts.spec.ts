import { test, expect } from "./fixtures/global-setup";

test("selects ten calendar layouts and exports the date list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "見た目", exact: true }).click();
  const controls = page.getByRole("region", { name: "レイアウト", exact: true });
  const calendar = page.locator("[data-calendar-layout]").first();
  await expect(controls.getByRole("button")).toHaveCount(11);
  await expect(calendar).toHaveAttribute("data-calendar-layout", "standard");

  for (const [label, layout] of [
    ["中央・短い下線", "centered"],
    ["右揃え・線なし", "right-aligned"],
    ["年月を上下に", "stacked"],
    ["月は左、年は右", "split"],
    ["全面格子", "full-grid"],
    ["左サイド見出し", "side-title"],
    ["罫線なし", "unruled"],
    ["日付カード", "cards"],
    ["週ごとの帯", "week-bands"],
    ["縦リスト", "date-list"],
  ]) {
    const button = controls.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(calendar).toHaveAttribute("data-calendar-layout", layout);
  }

  const dates = calendar.locator(".calendar-list-weekday");
  await expect(dates).toHaveCount(31);
  await expect(dates.first()).toHaveText("Fri");

  await page.getByRole("button", { name: "出力", exact: true }).click();
  const pendingDownload = page.waitForEvent("download");
  await page.getByText("単一HTMLファイル（画像埋め込み）", { exact: true }).click();
  const download = await pendingDownload;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  const html = Buffer.concat(chunks).toString("utf8");
  expect(html).toContain('<div data-calendar-layout="date-list"');
  expect(html).toContain('class="calendar-list-weekday"');
});
