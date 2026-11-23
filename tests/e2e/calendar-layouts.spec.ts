import type { Locator, Page } from "@playwright/test";
import type { CalendarState } from "../../src/stores/types";
import { CALENDAR_LAYOUTS, getCalendarTitle, getPresetStyle } from "../../src/lib/calendarLayouts";
import { DEFAULT_CALENDAR_STYLE } from "../../src/lib/constants";
import { formatMonthLabel, getWeekdayHeaders } from "../../src/lib/dateUtils";
import { FONT_PRESETS } from "../../src/lib/fonts";
import { test, expect, mobileTest } from "./fixtures/global-setup";

const month = "2027-01";
const testImage = "tests/e2e/fixtures/test-image.png";

async function openPanel(page: Page, name: "プリセット" | "基本設定" | "サイズと配置" | "データ") {
  const trigger = page.getByRole("button", { name, exact: true });
  if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
  return page.getByRole("region", { name, exact: true });
}

async function openFixture(page: Page, settings: Partial<CalendarState> = {}) {
  await page.route("https://holidays-jp.github.io/**", (route) => route.abort());
  await page.addInitScript(
    (state) => {
      if (sessionStorage.getItem("calendar-layout-test-seeded")) return;
      sessionStorage.setItem("calendar-layout-test-seeded", "1");
      localStorage.setItem("kalendar-user-settings", JSON.stringify({ version: 1, state }));
    },
    {
      startMonth: month,
      endMonth: month,
      weekStart: "sunday",
      orientation: "portrait",
      useImages: false,
      imagePosition: "top",
      calendarStyle: { ...DEFAULT_CALENDAR_STYLE, layoutPreset: "standard" },
      ...settings,
    },
  );
  await page.goto("/");
}

function gridOn(page: Page) {
  return page.locator("[data-calendar-layout]").first();
}

test("applies each preset's declared settings and carries over spacing", async ({ page }) => {
  const spacing = { cellPadding: 11, headerGap: 15, pageMarginTop: 37 };
  await openFixture(page, { calendarStyle: { ...DEFAULT_CALENDAR_STYLE, ...spacing } });
  const presets = await openPanel(page, "プリセット");
  const grid = gridOn(page);
  await expect(presets.getByText("変更すると他の設定も変わります")).toBeVisible();
  await expect(presets.getByRole("button")).toHaveCount(CALENDAR_LAYOUTS.length);

  for (const preset of CALENDAR_LAYOUTS) {
    const button = presets.getByRole("button", { name: preset.label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const style = getPresetStyle(preset.id);
    const font = FONT_PRESETS.find((item) => item.id === preset.fontId);
    expect(font).toBeDefined();
    const title = getCalendarTitle(
      style.titleOrder,
      formatMonthLabel(month, preset.monthLabelFormat),
    );
    const titleText =
      style.titleOrder === "stacked"
        ? (title.year ?? "") + title.main
        : title.main + (title.year ?? "");

    await expect(grid).toHaveAttribute("data-calendar-layout", preset.id);
    await expect(grid).toHaveAttribute("data-title-position", style.titlePosition);
    await expect(grid).toHaveAttribute("data-title-order", style.titleOrder);
    await expect(grid).toHaveAttribute("data-title-rule", style.titleRule);
    await expect(grid).toHaveAttribute("data-day-frame", String(style.dayFrame));
    await expect(grid).toHaveAttribute("data-day-rule-h", String(style.dayRuleH));
    await expect(grid).toHaveAttribute("data-day-rule-v", String(style.dayRuleV));
    await expect(grid).toHaveAttribute("data-weekday-align", style.weekdayAlign);
    await expect(grid.getByTestId("month-title")).toHaveText(titleText);
    await expect(grid.getByTestId("month-title")).toHaveCSS(
      "font-size",
      `${style.monthFontSize}px`,
    );
    const renderedDaySize =
      preset.id === "date-list" ? Math.min(style.dayFontSize, 14) : style.dayFontSize;
    await expect(grid.locator(".calendar-day-number").first()).toHaveCSS(
      "font-size",
      `${renderedDaySize}px`,
    );
    await expect(grid.locator(".calendar-weekdays > div").first()).toHaveCSS(
      "font-size",
      `${style.weekdayFontSize}px`,
    );
    await expect(grid.locator(".calendar-weekdays > div")).toHaveText(
      getWeekdayHeaders(preset.appearance.weekdayFormat, "sunday"),
    );
    await expect
      .poll(() =>
        grid.evaluate((element) => getComputedStyle(element).fontFamily.replaceAll('"', "")),
      )
      .toBe(font?.family);
    await expect(grid).toHaveCSS("font-weight", String(preset.appearance.fontWeight));
    await expect(page.getByTestId("page-container").first()).toHaveCSS(
      "padding-top",
      `${spacing.pageMarginTop}px`,
    );
    const paper = page.getByTestId("page-container").first();
    await expect
      .poll(async () => {
        const bounds = await paper.boundingBox();
        return bounds && bounds.width > bounds.height ? "landscape" : "portrait";
      })
      .toBe(preset.page.orientation);
  }

  const sizes = await openPanel(page, "サイズと配置");
  await expect(
    sizes.getByText("ヘッダー間隔", { exact: true }).locator("..").getByRole("slider"),
  ).toHaveValue(String(spacing.headerGap));
  await expect(
    sizes.getByText("上余白", { exact: true }).locator("..").getByRole("slider"),
  ).toHaveValue(String(spacing.pageMarginTop));
  // The list hides cell spacing. Switch to a grid before checking the preserved value.
  await openPanel(page, "プリセット");
  const standard = CALENDAR_LAYOUTS.find((preset) => preset.id === "standard")!;
  await presets.getByRole("button", { name: standard.label, exact: true }).click();
  await openPanel(page, "サイズと配置");
  await expect(
    sizes.getByText("セル余白", { exact: true }).locator("..").getByRole("slider"),
  ).toHaveValue(String(spacing.cellPadding));
});

test("renders independent date rules and an optional outer frame", async ({ page }) => {
  await openFixture(page);
  const sizes = await openPanel(page, "サイズと配置");
  const rules = sizes.getByRole("group", { name: "日付欄の罫線" });
  const vertical = rules.getByRole("checkbox", { name: "縦罫線" });
  const horizontal = rules.getByRole("checkbox", { name: "横罫線" });
  const frame = rules.getByRole("checkbox", { name: "枠", exact: true });
  const grid = gridOn(page);
  const weekdays = grid.locator(".calendar-weekdays");
  const days = grid.locator(".calendar-days");
  const cells = days.locator("> div");

  await frame.uncheck();
  await vertical.check();
  await horizontal.check();
  await expect(weekdays.locator("> div").first()).toHaveCSS("border-left-width", "0px");
  await expect(weekdays.locator("> div").nth(1)).toHaveCSS("border-left-width", "1px");
  await expect(weekdays.locator("> div").last()).toHaveCSS("border-right-width", "0px");
  await expect(cells.first()).toHaveCSS("border-left-width", "0px");
  await expect(cells.nth(6)).toHaveCSS("border-right-width", "0px");
  await expect(cells.nth(5)).toHaveCSS("border-bottom-width", "1px");
  await expect(weekdays).toHaveCSS("border-top-width", "0px");
  await expect(days).toHaveCSS("border-bottom-width", "0px");

  await frame.check();
  await horizontal.uncheck();
  await expect(cells.nth(5)).toHaveCSS("border-left-width", "1px");
  await expect(cells.nth(5)).toHaveCSS("border-bottom-width", "0px");
  await vertical.uncheck();
  await expect(cells.nth(5)).toHaveCSS("border-left-width", "0px");
  await expect(weekdays).toHaveCSS("border-top-width", "1px");
  await expect(days).toHaveCSS("border-right-width", "1px");
  await expect(days).toHaveCSS("border-bottom-width", "1px");
});

test("aligns right-justified headings, weekdays and holiday numbers by their rendered edges", async ({
  page,
}) => {
  await openFixture(page, { holidayMarkStyle: "underline", weekdayFormat: "en-short" });
  const sizes = await openPanel(page, "サイズと配置");
  await sizes.getByRole("combobox", { name: "見出しの位置" }).selectOption("right");
  await sizes.getByRole("combobox", { name: "曜日の左右揃え" }).selectOption("end");
  await sizes.getByRole("combobox", { name: "日付の左右揃え" }).selectOption("end");
  const grid = gridOn(page);
  const holiday = grid.locator(".calendar-holiday-underline").first();
  await expect(holiday).toHaveText("1");
  await expect(holiday).toHaveCSS("text-decoration-line", "underline");

  await expect
    .poll(() =>
      grid.evaluate((element) => {
        const edge = (selector: string) => {
          const range = document.createRange();
          range.selectNodeContents(element.querySelector(selector)!);
          return range.getBoundingClientRect().right;
        };
        return Math.max(
          Math.abs(edge(".calendar-title") - edge(".calendar-weekdays > :last-child")),
          Math.abs(
            edge(".calendar-weekdays > :last-child") -
              edge(".calendar-cell:nth-child(7) .calendar-day-number"),
          ),
          Math.abs(
            edge(".calendar-weekdays > :nth-child(6)") - edge(".calendar-holiday-underline"),
          ),
        );
      }),
    )
    .toBeLessThan(1);
});

test("keeps every week the same height when displaying holiday names", async ({ page }) => {
  await openFixture(page, {
    holidayMarkStyle: "name",
    manualHolidays: [{ date: "2027-01-01", name: "元日" }],
  });

  const expectUniformCells = async (grid: Locator) => {
    await expect(
      grid.locator(".calendar-holiday-name").getByText("元日", { exact: true }),
    ).toBeVisible();
    await expect(grid.locator(".calendar-cell")).toHaveCount(42);
    await expect
      .poll(() =>
        grid.locator(".calendar-cell").evaluateAll((cells) => {
          const heights = cells.map((cell) => cell.getBoundingClientRect().height);
          return Math.max(...heights) - Math.min(...heights);
        }),
      )
      .toBeLessThan(0.5);
  };

  await expectUniformCells(gridOn(page));

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "出力", exact: true }).click();
  await page.getByText("単一HTMLファイル（画像埋め込み）", { exact: true }).click();
  const chunks: Buffer[] = [];
  for await (const chunk of await (await downloading).createReadStream()) chunks.push(chunk);

  const print = await page.context().newPage();
  await print.route(/^https:\/\/fonts\./, (route) => route.abort());
  await print.emulateMedia({ media: "print" });
  await print.setContent(Buffer.concat(chunks).toString("utf8"), { waitUntil: "domcontentloaded" });
  await expectUniformCells(gridOn(print));
  await print.close();
});

test("restores edited layout settings after reload and when reimporting printed HTML", async ({
  page,
}) => {
  await openFixture(page, {
    orientation: "landscape",
    imagePosition: "left",
    useImages: true,
    monthLabelFormat: "ja",
    weekdayFormat: "ja",
    holidayMarkStyle: "name",
    manualHolidays: [{ date: "2027-01-01", name: "元日" }],
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE, layoutPreset: "date-list" },
  });
  const container = page.getByTestId("page-container").first();
  const image = container.getByTestId("image-area");
  const sizes = await openPanel(page, "サイズと配置");
  await sizes.getByRole("combobox", { name: "見出しの位置" }).selectOption("center");
  await sizes.getByRole("combobox", { name: "年と月の並べ方" }).selectOption("together");
  await sizes.getByRole("combobox", { name: "見出しの下線" }).selectOption("none");
  await sizes.getByRole("combobox", { name: "日付の上下揃え" }).selectOption("end");
  await sizes.getByRole("checkbox", { name: "枠", exact: true }).check();
  await expect(page.getByText(/自動保存済み/)).toBeVisible();
  await page.reload();

  const preview = gridOn(page);
  await expect(container).toHaveCSS("flex-direction", "row");
  await expect(preview.getByTestId("month-title")).toHaveText("2027年1月");
  await expect(preview.getByTestId("month-title")).toHaveCSS("text-align", "center");
  await expect(preview.locator(".calendar-title-rule")).toBeHidden();
  await expect(preview).toHaveAttribute("data-day-align-v", "end");
  await image.locator('input[type="file"]').setInputFiles(testImage);
  await expect(image.locator("img").first()).toBeVisible();
  await expect(page.getByText(/自動保存済み/)).toBeVisible();
  await page.reload();
  await expect(image.locator("img").first()).toBeVisible();

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "出力", exact: true }).click();
  await page.getByText("単一HTMLファイル（画像埋め込み）", { exact: true }).click();
  const chunks: Buffer[] = [];
  for await (const chunk of await (await downloading).createReadStream()) chunks.push(chunk);
  const html = Buffer.concat(chunks);

  const print = await page.context().newPage();
  await print.route(/^https:\/\/fonts\./, (route) => route.abort());
  await print.emulateMedia({ media: "print" });
  await print.setContent(html.toString("utf8"), { waitUntil: "domcontentloaded" });
  const printedPage = print.locator(".page").first();
  const printGrid = gridOn(print);
  const printedDates = printGrid.locator(".calendar-cell:not([data-empty])");
  await expect(printedDates).toHaveCount(31);
  await expect(
    printGrid.locator(".calendar-holiday-name").getByText("元日", { exact: true }),
  ).toBeVisible();
  await expect(printGrid.locator(".calendar-title")).toHaveCSS("text-align", "center");
  await expect(printGrid.locator(".calendar-title-rule")).toBeHidden();
  await expect(printGrid.locator(".calendar-days")).toHaveCSS("border-right-width", "1px");
  await expect
    .poll(() =>
      printedDates.last().evaluate((cell) => {
        const number = cell.querySelector(".calendar-day-number")!;
        return cell.getBoundingClientRect().bottom - number.getBoundingClientRect().bottom;
      }),
    )
    .toBeLessThanOrEqual(2);
  await expect
    .poll(async () => {
      const sheet = await printedPage.boundingBox();
      const picture = await printedPage.locator("img").boundingBox();
      const first = await printedDates.first().boundingBox();
      const last = await printedDates.last().boundingBox();
      return (
        !!sheet &&
        !!picture &&
        !!first &&
        !!last &&
        sheet.width > sheet.height &&
        picture.x < first.x &&
        Math.abs(first.x - last.x) < 1 &&
        last.y > first.y &&
        last.y + last.height <= sheet.y + sheet.height + 1
      );
    })
    .toBe(true);
  await print.close();

  const presets = await openPanel(page, "プリセット");
  const standard = CALENDAR_LAYOUTS.find((preset) => preset.id === "standard")!;
  await presets.getByRole("button", { name: standard.label, exact: true }).click();
  await expect(preview).toHaveAttribute("data-calendar-layout", standard.id);
  const data = await openPanel(page, "データ");
  await data.locator('input[accept=".html,.htm"]').setInputFiles({
    name: "calendar.html",
    mimeType: "text/html",
    buffer: html,
  });
  await expect(preview).toHaveAttribute("data-calendar-layout", "date-list");
  await expect(preview.getByTestId("month-title")).toHaveCSS("text-align", "center");
  await expect(preview).toHaveAttribute("data-day-frame", "true");
  await expect(container).toHaveCSS("flex-direction", "row");
});

mobileTest("selects a preset from the mobile settings sheet", async ({ page }) => {
  await openFixture(page);
  await page.getByRole("button", { name: "設定", exact: true }).click();
  const presets = await openPanel(page, "プリセット");
  const choice = CALENDAR_LAYOUTS.find((preset) => preset.id !== "standard")!;
  const button = presets.getByRole("button", { name: choice.label, exact: true });
  await button.tap();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(gridOn(page)).toHaveAttribute("data-calendar-layout", choice.id);
});

test("aligns holiday dots below the date digits and shows holiday names in the date list preset", async ({
  page,
}) => {
  await openFixture(page, {
    endMonth: "2027-05",
    manualHolidays: [
      { date: "2027-01-01", name: "元日" },
      { date: "2027-01-11", name: "成人の日" },
      { date: "2027-05-04", name: "みどりの日" },
    ],
  });
  const sizes = await openPanel(page, "サイズと配置");
  for (const alignment of ["start", "center", "end"]) {
    await sizes.getByRole("combobox", { name: "日付の左右揃え" }).selectOption(alignment);
    await expectDotsUnderDates(gridOn(page));
  }

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "出力", exact: true }).click();
  await page.getByText("単一HTMLファイル（画像埋め込み）", { exact: true }).click();
  const chunks: Buffer[] = [];
  for await (const chunk of await (await downloading).createReadStream()) chunks.push(chunk);
  const print = await page.context().newPage();
  await print.route(/^https:\/\/fonts\./, (route) => route.abort());
  await print.emulateMedia({ media: "print" });
  await print.setContent(Buffer.concat(chunks).toString("utf8"), { waitUntil: "domcontentloaded" });
  await expectDotsUnderDates(gridOn(print));
  await print.close();

  const presets = await openPanel(page, "プリセット");
  await presets.getByRole("button", { name: "縦リスト" }).click();
  const names = page.locator(".calendar-holiday-name");
  await expect(names.getByText("元日", { exact: true })).toBeVisible();
  await expect(names.getByText("みどりの日", { exact: true })).toBeVisible();
  const basic = await openPanel(page, "基本設定");
  await expect(basic.getByRole("combobox", { name: "祝日マーク" })).toHaveValue("name");
});

async function expectDotsUnderDates(grid: Locator) {
  const dates = grid.locator(".calendar-day-with-dot");
  await expect(dates.first()).toBeVisible();
  await expect
    .poll(() =>
      dates.evaluateAll((labels) =>
        labels.every((label) => {
          const digits = document.createRange();
          digits.selectNode(label.firstChild!);
          const date = digits.getBoundingClientRect();
          const dot = label.querySelector(".calendar-holiday-dot")!.getBoundingClientRect();
          return (
            Math.abs(dot.left + dot.width / 2 - date.left - date.width / 2) < 1 &&
            dot.top >= date.bottom - 0.5
          );
        }),
      ),
    )
    .toBe(true);
  await expect(dates.first().locator(".calendar-holiday-dot")).toHaveCSS("width", "4px");
}
