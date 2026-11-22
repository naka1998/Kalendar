import { test, expect } from "./fixtures/global-setup";

test("selects calendar presets and exports the date list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "見た目", exact: true }).click();
  await page.getByText("詳細調整", { exact: true }).click();
  const controls = page.getByRole("region", { name: "プリセット", exact: true });
  const calendar = page.locator("[data-calendar-layout]").first();
  await expect(controls.getByRole("button")).toHaveCount(10);
  await expect(calendar).toHaveAttribute("data-calendar-layout", "standard");
  const horizontal = page.getByRole("combobox", { name: "日付の左右揃え" });
  const vertical = page.getByRole("combobox", { name: "日付の上下揃え" });
  await horizontal.selectOption("end");
  await vertical.selectOption("end");
  const dayCell = calendar.locator(".calendar-cell:not([data-empty])").first();
  await expect
    .poll(() =>
      dayCell.evaluate((cell) => {
        const bounds = cell.getBoundingClientRect();
        const number = cell.querySelector(".calendar-day-number")!.getBoundingClientRect();
        return bounds.right - number.right < number.left - bounds.left;
      }),
    )
    .toBe(true);
  await expect(dayCell).toHaveCSS("padding-top", "16px");
  await expect(dayCell).toHaveCSS("padding-bottom", "0px");

  for (const [label, layout] of [
    ["書き込み用", "writing"],
    ["中央・短い下線", "centered"],
    ["右揃え・線なし", "right-aligned"],
    ["年月を上下に", "stacked"],
    ["月は左、年は右", "split"],
    ["左サイド見出し", "side-title"],
    ["日付カード", "cards"],
    ["週ごとの帯", "week-bands"],
    ["縦リスト", "date-list"],
  ]) {
    const button = controls.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(calendar).toHaveAttribute("data-calendar-layout", layout);
  }

  await expect(horizontal).toHaveValue("");
  await expect(vertical).toHaveValue("");
  await horizontal.selectOption("end");
  await vertical.selectOption("end");
  await page.getByRole("combobox", { name: "年と月の並べ方" }).selectOption("together");
  await page.getByRole("combobox", { name: "見出しの位置" }).selectOption("center");
  await page.getByRole("combobox", { name: "見出しの下線" }).selectOption("none");
  await expect(calendar.getByTestId("month-title")).toHaveCSS("text-align", "center");
  await expect(calendar.locator(".calendar-title-rule")).toBeHidden();
  await expect(controls.getByRole("button", { name: "縦リスト", exact: true })).toContainText(
    "調整済み",
  );
  await expect
    .poll(() =>
      dayCell.evaluate((cell) => {
        const bounds = cell.getBoundingClientRect();
        const number = cell.querySelector(".calendar-day-number")!.getBoundingClientRect();
        return bounds.bottom - number.bottom <= 2;
      }),
    )
    .toBe(true);

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
  expect(html).toContain(
    'data-title-position="center" data-title-order="together" data-title-rule="none"',
  );
  expect(html).toContain('data-day-rule-h="true" data-day-rule-v="false"');
  expect(html).toContain('data-day-align-h="end" data-day-align-v="end"');
});

test("applies preset defaults and preserves print margin and font", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "見た目", exact: true }).click();
  await page.getByText("詳細調整", { exact: true }).click();
  const layout = page.getByRole("region", { name: "プリセット", exact: true });
  const daySize = page.getByText("日付", { exact: true }).locator("..").getByRole("slider");
  const monthTitle = page.getByTestId("month-title").first();
  await layout.getByRole("button", { name: "日付カード", exact: true }).click();
  await expect(daySize).toHaveValue("18");
  await expect(monthTitle).toHaveCSS("font-size", "54px");

  const margin = page.getByText("上余白", { exact: true }).locator("..").getByRole("slider");
  await margin.press("End");
  await page.getByRole("button", { name: "Inter", exact: true }).click();
  await daySize.press("End");
  await expect(daySize).toHaveValue("24");
  await layout.getByRole("button", { name: "標準グリッド", exact: true }).click();
  await expect(daySize).toHaveValue("14");
  await expect(margin).toHaveValue("80");
  await expect(page.getByRole("button", { name: "Inter", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(monthTitle).toHaveCSS("font-size", "48px");
});

test("toggles vertical and horizontal rules independently", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "見た目", exact: true }).click();
  await page.getByText("詳細調整", { exact: true }).click();
  const rules = page.getByRole("group", { name: "日付欄の罫線" });
  const vertical = rules.getByRole("checkbox", { name: "縦罫線" });
  const horizontal = rules.getByRole("checkbox", { name: "横罫線" });
  const calendar = page.locator("[data-calendar-layout]").first();
  const cell = calendar.locator(".calendar-cell[data-ruled]").first();

  await expect(cell).toHaveCSS("border-left-width", "0px");
  await expect(cell).toHaveCSS("border-bottom-width", "1px");
  await vertical.click();
  await expect(cell).toHaveCSS("border-left-width", "1px");
  await expect(cell).toHaveCSS("border-bottom-width", "1px");
  await horizontal.click();
  await expect(cell).toHaveCSS("border-left-width", "1px");
  await expect(cell).toHaveCSS("border-bottom-width", "0px");
  await vertical.click();
  await expect(cell).toHaveCSS("border-left-width", "0px");
  await expect(cell).toHaveCSS("border-bottom-width", "0px");

  const layouts = page.getByRole("region", { name: "プリセット", exact: true });
  await layouts.getByRole("button", { name: "日付カード", exact: true }).click();
  await expect(calendar).toHaveAttribute("data-day-rule-v", "true");
  await expect(calendar).toHaveAttribute("data-day-rule-h", "true");
});
