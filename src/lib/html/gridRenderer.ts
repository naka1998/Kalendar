import type { PageData } from "@/stores/types";
import { escapeHtml } from "../htmlUtils";
import { renderDayCell } from "./cellRenderer";

export function renderGridHtml(page: PageData): string {
  let gridHtml = "";
  // Month label
  gridHtml += `<div style="color:${page.theme.colors.monthLabel};font-size:24px;font-weight:800;letter-spacing:-0.05em;margin-bottom:8px">${escapeHtml(page.monthLabel)}</div>`;
  // Header rule
  gridHtml += `<div style="border-bottom:1px solid ${page.theme.colors.headerRule};margin-bottom:8px"></div>`;
  // Weekday headers
  gridHtml += `<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px">`;
  for (const header of page.weekdayHeaders) {
    gridHtml += `<div style="text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${page.theme.colors.weekdayHeader};padding:4px 0">${escapeHtml(header)}</div>`;
  }
  gridHtml += `</div>`;
  // Day grid
  gridHtml += `<div style="display:grid;grid-template-columns:repeat(7,1fr)">`;
  for (let ri = 0; ri < page.grid.length; ri++) {
    for (let ci = 0; ci < page.grid[ri].length; ci++) {
      gridHtml += renderDayCell(page, ri, ci, page.grid.length);
    }
  }
  gridHtml += `</div>`;
  return gridHtml;
}
