import type { PageData } from "@/stores/types";
import { DEFAULT_CALENDAR_STYLE } from "@/lib/constants";
import { escapeHtml } from "../htmlUtils";
import { getCalendarTitle, resolveCalendarLayout, type CalendarLayout } from "../calendarLayouts";
import { renderDayCell } from "./cellRenderer";

export interface GridStyleOverrides {
  layoutPreset?: CalendarLayout;
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
  const title = getCalendarTitle(layout, page.monthLabel);
  const year = title.year
    ? `<span class="calendar-title-year">${escapeHtml(title.year)}</span>`
    : "";
  const titleText =
    layout === "stacked" ? year + escapeHtml(title.main) : escapeHtml(title.main) + year;
  const dayCount = page.grid.flat().filter((cell) => cell.isCurrentMonth && cell.date).length;
  let gridHtml = `<div data-calendar-layout="${layout}" style="width:${gridWidth}%;--calendar-grid-rule:${page.theme.colors.gridRule};--calendar-list-rows:${Math.ceil(dayCount / 2)};--calendar-list-short-rows:${Math.ceil(dayCount / 3)}">`;
  // Month label
  gridHtml += `<div class="calendar-title" style="color:${page.theme.colors.monthLabel};font-size:${monthFontSize}px;font-weight:800;letter-spacing:-0.05em;margin-bottom:${headerGap}px">${titleText}</div>`;
  // Header rule
  gridHtml += `<div class="calendar-title-rule" style="border-bottom:1px solid ${page.theme.colors.headerRule};margin-bottom:${headerGap}px"></div>`;
  // Weekday headers
  gridHtml += `<div class="calendar-weekdays" style="margin-bottom:${Math.round(headerGap / 2)}px">`;
  for (const header of page.weekdayHeaders) {
    gridHtml += `<div style="font-size:${weekdayFontSize}px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${page.theme.colors.weekdayHeader};padding:${Math.round(cellPadding / 2)}px 0">${escapeHtml(header)}</div>`;
  }
  gridHtml += `</div>`;
  // Day grid
  gridHtml += `<div class="calendar-days">`;
  for (let ri = 0; ri < page.grid.length; ri++) {
    for (let ci = 0; ci < page.grid[ri].length; ci++) {
      gridHtml += renderDayCell(page, ri, ci, page.grid.length, {
        dayFontSize,
        cellPadding,
        showWeekday: layout === "date-list",
      });
    }
  }
  gridHtml += `</div>`;
  gridHtml += `</div>`; // close grid wrapper
  return gridHtml;
}
