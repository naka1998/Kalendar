import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/global-setup";

async function openPanel(page: Page, name: "見た目" | "サイズと配置") {
  const trigger = page.getByRole("button", { name, exact: true });
  if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
}

test("selects calendar presets and exports the date list", async ({ page }) => {
  await page.goto("/");
  await openPanel(page, "見た目");
  const controls = page.getByRole("region", { name: "プリセット", exact: true });
  const calendar = page.locator("[data-calendar-layout]").first();
  await expect(controls.getByRole("button")).toHaveCount(10);
  await expect(calendar).toHaveAttribute("data-calendar-layout", "standard");
  await openPanel(page, "サイズと配置");
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

  await openPanel(page, "見た目");
  for (const [label, layout] of [
    ["書き込み用", "writing"],
    ["クラシカル", "centered"],
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

  await openPanel(page, "サイズと配置");
  await expect(horizontal).toHaveValue("");
  await expect(vertical).toHaveValue("");
  await horizontal.selectOption("end");
  await vertical.selectOption("end");
  await page.getByRole("combobox", { name: "年と月の並べ方" }).selectOption("together");
  await page.getByRole("combobox", { name: "見出しの位置" }).selectOption("center");
  await page.getByRole("combobox", { name: "見出しの下線" }).selectOption("none");
  await expect(calendar.getByTestId("month-title")).toHaveCSS("text-align", "center");
  await expect(calendar.locator(".calendar-title-rule")).toBeHidden();
  await page.getByRole("checkbox", { name: "枠", exact: true }).check();
  await openPanel(page, "見た目");
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

  const pageContainer = page.getByTestId("page-container").first();
  await expect(pageContainer).toHaveCSS("flex-direction", "row");
  const image = pageContainer.getByTestId("image-area");
  await image.locator('input[type="file"]').setInputFiles("tests/e2e/fixtures/test-image.png");
  await expect(image.locator("img").first()).toBeVisible();
  await expect
    .poll(async () => {
      const imageBox = await image.boundingBox();
      const calendarBox = await calendar.boundingBox();
      return !!imageBox && !!calendarBox && imageBox.x < calendarBox.x;
    })
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
  expect(html).toContain("@page { size: A4 landscape;");
  const calendarIndex = html.indexOf('<div data-calendar-layout="date-list"');
  const imageIndex = html.indexOf('<img src="data:image/');
  expect(imageIndex).toBeGreaterThan(-1);
  expect(calendarIndex).toBeGreaterThan(imageIndex);
  expect(html).toContain('class="calendar-list-weekday"');
  expect(html).toContain(
    'data-title-position="center" data-title-order="together" data-title-rule="none"',
  );
  expect(html).toContain('data-day-rule-h="true" data-day-rule-v="false" data-day-frame="true"');
  expect(html).toContain('data-day-align-h="end" data-day-align-v="end"');

  await controls.getByRole("button", { name: "日付カード", exact: true }).click();
  await expect(calendar).toHaveAttribute("data-calendar-layout", "cards");
  await expect(pageContainer).toHaveCSS("flex-direction", "column");
  await expect
    .poll(async () => {
      const paper = await pageContainer.boundingBox();
      const imageBox = await image.boundingBox();
      const calendarBox = await calendar.boundingBox();
      return (
        !!paper &&
        !!imageBox &&
        !!calendarBox &&
        paper.height > paper.width &&
        imageBox.y < calendarBox.y
      );
    })
    .toBe(true);
  await expect(image.locator("img").first()).toBeVisible();
});

test("applies preset font and month format and preserves print margin", async ({ page }) => {
  await page.goto("/");
  await openPanel(page, "見た目");
  const layout = page.getByRole("region", { name: "プリセット", exact: true });
  const daySize = page.getByText("日付", { exact: true }).locator("..").getByRole("slider");
  const monthTitle = page.getByTestId("month-title").first();
  await layout.getByRole("button", { name: "クラシカル", exact: true }).click();
  await expect(page.getByRole("button", { name: "Shippori Mincho", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(monthTitle).toHaveText("January 2027");
  await layout.getByRole("button", { name: "日付カード", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "M PLUS Rounded 1c", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(monthTitle).toHaveText("2027年1月");
  await openPanel(page, "サイズと配置");
  await expect(daySize).toHaveValue("18");
  await expect(monthTitle).toHaveCSS("font-size", "54px");

  const margin = page.getByText("上余白", { exact: true }).locator("..").getByRole("slider");
  await margin.press("End");
  await daySize.press("End");
  await expect(daySize).toHaveValue("24");
  await openPanel(page, "見た目");
  await layout.getByRole("button", { name: "標準", exact: true }).click();
  await expect(page.getByRole("button", { name: "Montserrat", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await openPanel(page, "サイズと配置");
  await expect(daySize).toHaveValue("14");
  await expect(margin).toHaveValue("80");
  await expect(monthTitle).toHaveCSS("font-size", "48px");
  await expect(monthTitle).toHaveText("2027.01");
});

test("toggles vertical rules, horizontal rules and the frame independently", async ({ page }) => {
  await page.goto("/");
  await openPanel(page, "サイズと配置");
  const rules = page.getByRole("group", { name: "日付欄の罫線" });
  const vertical = rules.getByRole("checkbox", { name: "縦罫線" });
  const horizontal = rules.getByRole("checkbox", { name: "横罫線" });
  const calendar = page.locator("[data-calendar-layout]").first();
  const frame = rules.getByRole("checkbox", { name: "枠", exact: true });
  const weekdays = calendar.locator(".calendar-weekdays");
  const days = calendar.locator(".calendar-days");
  const cell = days.locator(".calendar-cell[data-ruled]").first();

  await expect(cell).toHaveCSS("border-left-width", "0px");
  await expect(cell).toHaveCSS("border-bottom-width", "1px");
  await vertical.click();
  await expect(cell).toHaveCSS("border-left-width", "1px");
  await expect(cell).toHaveCSS("border-bottom-width", "1px");
  await expect(weekdays.locator("> div").first()).toHaveCSS("border-left-width", "0px");
  await expect(weekdays.locator("> div").nth(1)).toHaveCSS("border-left-width", "1px");
  await expect(weekdays.locator("> div").last()).toHaveCSS("border-right-width", "0px");
  await expect(days.locator("> div").first()).toHaveCSS("border-left-width", "0px");
  await expect(days.locator("> div").nth(6)).toHaveCSS("border-right-width", "0px");
  await expect(weekdays).toHaveCSS("border-top-width", "0px");
  await expect(days).toHaveCSS("border-bottom-width", "0px");
  await frame.check();
  await expect(weekdays).toHaveCSS("border-top-width", "1px");
  await expect(days).toHaveCSS("border-bottom-width", "1px");
  await expect(days).toHaveCSS("border-right-width", "1px");
  await horizontal.click();
  await expect(cell).toHaveCSS("border-left-width", "1px");
  await expect(cell).toHaveCSS("border-bottom-width", "0px");
  await vertical.click();
  await expect(cell).toHaveCSS("border-left-width", "0px");
  await expect(cell).toHaveCSS("border-bottom-width", "0px");

  await expect(days).toHaveCSS("border-right-width", "1px");
  await frame.uncheck();
  await expect(days).toHaveCSS("border-right-width", "0px");
  await openPanel(page, "見た目");
  const layouts = page.getByRole("region", { name: "プリセット", exact: true });
  await layouts.getByRole("button", { name: "日付カード", exact: true }).click();
  await expect(calendar).toHaveAttribute("data-day-rule-v", "true");
  await expect(calendar).toHaveAttribute("data-day-rule-h", "true");
});
