import type { PageData } from "@/stores/types";
import { DEFAULT_CALENDAR_STYLE } from "@/lib/constants";
import { escapeHtml } from "../htmlUtils";
import { renderDayCell } from "./cellRenderer";

export interface GridStyleOverrides {
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

  let gridHtml = `<div style="width:${gridWidth}%">`;
  // Month label
  gridHtml += `<div style="color:${page.theme.colors.monthLabel};font-size:${monthFontSize}px;font-weight:800;letter-spacing:-0.05em;margin-bottom:${headerGap}px">${escapeHtml(page.monthLabel)}</div>`;
  // Header rule
  gridHtml += `<div style="border-bottom:1px solid ${page.theme.colors.headerRule};margin-bottom:${headerGap}px"></div>`;
  // Weekday headers
  gridHtml += `<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:${Math.round(headerGap / 2)}px">`;
  for (const header of page.weekdayHeaders) {
    gridHtml += `<div style="text-align:center;font-size:${weekdayFontSize}px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${page.theme.colors.weekdayHeader};padding:${Math.round(cellPadding / 2)}px 0">${escapeHtml(header)}</div>`;
  }
  gridHtml += `</div>`;
  // Day grid
  gridHtml += `<div style="display:grid;grid-template-columns:repeat(7,1fr)">`;
  for (let ri = 0; ri < page.grid.length; ri++) {
    for (let ci = 0; ci < page.grid[ri].length; ci++) {
      gridHtml += renderDayCell(page, ri, ci, page.grid.length, { dayFontSize, cellPadding });
    }
  }
  gridHtml += `</div>`;
  gridHtml += `</div>`; // close grid wrapper
  return gridHtml;
}
