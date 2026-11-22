import type { CalendarStyle, ContentAlign, PageData } from "@/stores/types";
import { DEFAULT_CALENDAR_STYLE } from "@/lib/constants";
import { escapeHtml } from "../htmlUtils";
import {
  getCalendarTitle,
  resolveCalendarLayout,
  resolveDayAlignment,
  getTitleSettings,
  getDayRules,
} from "../calendarLayouts";
import { renderDayCell } from "./cellRenderer";

export interface GridStyleOverrides extends Pick<
  CalendarStyle,
  "layoutPreset" | "titlePosition" | "titleOrder" | "titleRule" | "weekdayAlign"
> {
  dayRuleH?: boolean;
  dayRuleV?: boolean;
  dayFrame?: boolean;
  dayAlignH?: ContentAlign;
  dayAlignV?: ContentAlign;
  monthFontSize?: number;
  weekdayFontSize?: number;
  cellPadding?: number;
  headerGap?: number;
  dayFontSize?: number;
}

export function renderGridHtml(
  page: PageData,
  gridWidth = 100,
  style?: GridStyleOverrides,
): string {
  const monthFontSize = style?.monthFontSize ?? DEFAULT_CALENDAR_STYLE.monthFontSize;
  const weekdayFontSize = style?.weekdayFontSize ?? DEFAULT_CALENDAR_STYLE.weekdayFontSize;
  const headerGap = style?.headerGap ?? DEFAULT_CALENDAR_STYLE.headerGap;
  const cellPadding = style?.cellPadding ?? DEFAULT_CALENDAR_STYLE.cellPadding;
  const dayFontSize = style?.dayFontSize ?? DEFAULT_CALENDAR_STYLE.dayFontSize;

  const layout = resolveCalendarLayout(style?.layoutPreset);
  const { dayRuleH, dayRuleV, dayFrame } = getDayRules(style);
  const { titlePosition, titleOrder, titleRule, weekdayAlign } = getTitleSettings(style);
  const title = getCalendarTitle(titleOrder, page.monthLabel);
  const dayAlignH = resolveDayAlignment(style?.dayAlignH);
  const dayAlignV = resolveDayAlignment(style?.dayAlignV);
  const alignmentAttrs = [
    dayAlignH && ` data-day-align-h="${dayAlignH}"`,
    dayAlignV && ` data-day-align-v="${dayAlignV}"`,
  ].join("");
  const year = title.year
    ? `<span class="calendar-title-year">${escapeHtml(title.year)}</span>`
    : "";
  const titleText =
    titleOrder === "stacked" ? year + escapeHtml(title.main) : escapeHtml(title.main) + year;
  const dayCount = page.grid.flat().filter((cell) => cell.isCurrentMonth && cell.date).length;
  let gridHtml = `<div data-calendar-layout="${layout}"${alignmentAttrs} data-day-rule-h="${dayRuleH}" data-day-rule-v="${dayRuleV}" data-day-frame="${dayFrame}" data-title-position="${titlePosition}" data-title-order="${titleOrder}" data-title-rule="${titleRule}" data-weekday-align="${weekdayAlign}" style="width:${gridWidth}%;--calendar-grid-rule:${page.theme.colors.gridRule};--calendar-holiday-mark:${page.theme.colors.holidayMark};--calendar-list-rows:${Math.ceil(dayCount / 2)};--calendar-list-short-rows:${Math.ceil(dayCount / 3)}">`;
  // Month label
  gridHtml += `<div class="calendar-title" style="color:${page.theme.colors.monthLabel};font-size:${monthFontSize}px;font-weight:800;margin-bottom:${headerGap}px">${titleText}</div>`;
  // Header rule
  gridHtml += `<div class="calendar-title-rule" style="border-bottom:1px solid ${page.theme.colors.headerRule};margin-bottom:${headerGap}px"></div>`;
  // Weekday headers
  gridHtml += `<div class="calendar-weekdays" style="margin-bottom:${dayFrame || dayRuleV ? 0 : Math.round(headerGap / 2)}px">`;
  for (const header of page.weekdayHeaders) {
    gridHtml += `<div style="font-size:${weekdayFontSize}px;font-weight:700;text-transform:uppercase;color:${page.theme.colors.weekdayHeader};padding:${Math.round(cellPadding / 2)}px 0">${escapeHtml(header)}</div>`;
  }
  gridHtml += `</div>`;
  // Day grid
  gridHtml += `<div class="calendar-days">`;
  for (let ri = 0; ri < page.grid.length; ri++) {
    for (let ci = 0; ci < page.grid[ri].length; ci++) {
      gridHtml += renderDayCell(page, ri, ci, page.grid.length, {
        dayFontSize,
        cellPadding,
        dayAlignV,
        showWeekday: layout === "date-list",
      });
    }
  }
  gridHtml += `</div>`;
  gridHtml += `</div>`; // close grid wrapper
  return gridHtml;
}
