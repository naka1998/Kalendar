import type { PageData, HolidayMarkStyle } from "@/stores/types";

export function renderHolidayMark(style: HolidayMarkStyle, color: string): string {
  switch (style) {
    case "dot":
      return `<span style="display:block;margin:2px auto 0;width:6px;height:6px;border-radius:50%;background:${color}"></span>`;
    case "circle":
    case "underline":
    case "color-only":
      return "";
  }
}

export function renderDayCell(page: PageData, ri: number, ci: number, totalRows: number): string {
  const cell = page.grid[ri][ci];
  if (!cell.date || !cell.isCurrentMonth) {
    return `<div style="padding:8px 0"></div>`;
  }

  let textColor = page.theme.colors.text;
  if (cell.isHoliday || cell.isSunday) textColor = page.theme.colors.sunday;
  else if (cell.isSaturday) textColor = page.theme.colors.saturday;

  const isCircle = cell.isHoliday && page.holidayMarkStyle === "circle";
  const isUnderline = cell.isHoliday && page.holidayMarkStyle === "underline";

  const borderBottom =
    ri < totalRows - 1 ? `border-bottom:1px solid ${page.theme.colors.gridRule};` : "";

  let spanStyle = `color:${textColor};display:flex;align-items:center;justify-content:center;width:24px;height:24px;font-size:12px;`;
  if (isCircle)
    spanStyle += `border-radius:50%;border:1.5px solid ${page.theme.colors.holidayMark};`;
  if (isUnderline) spanStyle += `border-bottom:2px solid ${page.theme.colors.holidayMark};`;

  const mark = cell.isHoliday
    ? renderHolidayMark(page.holidayMarkStyle, page.theme.colors.holidayMark)
    : "";

  return `<div style="display:flex;flex-direction:column;align-items:center;padding:8px 0;${borderBottom}"><span style="${spanStyle}">${cell.dayOfMonth}</span>${mark}</div>`;
}
