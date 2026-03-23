import type { HtmlGeneratorInput, PageData, HolidayMarkStyle, ImagePosition } from "@/stores/types";
import { isHorizontalLayout } from "./layoutUtils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHolidayMark(style: HolidayMarkStyle, color: string): string {
  switch (style) {
    case "dot":
      return `<span style="display:block;margin:2px auto 0;width:6px;height:6px;border-radius:50%;background:${color}"></span>`;
    case "circle":
    case "underline":
    case "color-only":
      return "";
  }
}

function renderDayCell(page: PageData, ri: number, ci: number, totalRows: number): string {
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

function renderGridHtml(page: PageData): string {
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

function renderImageHtml(page: PageData, sizeProperty: string, sizeValue: string): string {
  return `<div style="${sizeProperty}:${sizeValue};display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="width:100%;height:100%;object-fit:contain" /></div>`;
}

function justifyContentValue(align: string | undefined): string {
  if (align === "start") return "flex-start";
  if (align === "end") return "flex-end";
  return "center";
}

function renderGridContainer(
  gridHtml: string,
  sizeProperty: string,
  sizeValue: string,
  contentAlign?: string,
): string {
  const justify = `justify-content:${justifyContentValue(contentAlign)}`;
  return `<div style="${sizeProperty}:${sizeValue};display:flex;flex-direction:column;${justify};padding:16px 24px;overflow:hidden">${gridHtml}</div>`;
}

function renderPage(
  page: PageData,
  orientation: string,
  fontFamily: string,
  fontWeight: number,
  calendarStyle?: Partial<{ contentAlign: string; pageMarginTop: number }>,
): string {
  const { colors } = page.theme;
  const width = orientation === "portrait" ? "210mm" : "297mm";
  const height = orientation === "portrait" ? "297mm" : "210mm";

  const position: ImagePosition = page.imagePosition;
  const horizontal = isHorizontalLayout(position);
  const imgPct = page.imagePercent;
  const gridPct = 100 - imgPct;
  const sizeProperty = horizontal ? "width" : "height";
  const marginTop = calendarStyle?.pageMarginTop
    ? `padding-top:${calendarStyle.pageMarginTop}px;`
    : "";

  let contentHtml: string;

  if (page.imageBase64) {
    const gridHtml = renderGridHtml(page);
    const imageBlock = renderImageHtml(page, sizeProperty, `${imgPct}%`);
    const gridBlock = renderGridContainer(
      gridHtml,
      sizeProperty,
      `${gridPct}%`,
      calendarStyle?.contentAlign,
    );

    const isReversed = position === "bottom" || position === "right";
    const containerStyle = horizontal
      ? "display:flex;flex-direction:row;height:100%"
      : "display:flex;flex-direction:column;height:100%";

    if (isReversed) {
      contentHtml = `<div style="${containerStyle}">${gridBlock}${imageBlock}</div>`;
    } else {
      contentHtml = `<div style="${containerStyle}">${imageBlock}${gridBlock}</div>`;
    }
  } else {
    const gridHtml = renderGridHtml(page);
    contentHtml = `<div style="height:100%;padding:24px;">${gridHtml}</div>`;
  }

  return `<div class="page" style="width:${width};height:${height};${marginTop}background:${colors.background};page-break-after:always;position:relative;overflow:hidden;font-family:'${escapeHtml(fontFamily)}',sans-serif;font-weight:${fontWeight}">${contentHtml}</div>`;
}

export function generateSingleHtml(input: HtmlGeneratorInput, settingsJson?: string): string {
  const { pages, orientation, fontFamily, fontWeight, googleFontsUrl } = input;
  const size = orientation === "portrait" ? "A4 portrait" : "A4 landscape";

  let pagesHtml = "";
  for (const page of pages) {
    pagesHtml += renderPage(page, orientation, fontFamily, fontWeight, input.calendarStyle);
  }

  const settingsMeta = settingsJson
    ? `\n<meta name="kalendar-settings" content='${escapeHtml(settingsJson)}'>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">${settingsMeta}
<title>Calendar</title>
<link href="${escapeHtml(googleFontsUrl)}" rel="stylesheet">
<style>
@page { size: ${size}; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.page:last-child { page-break-after: auto; }
</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

export function generateExternalHtml(input: HtmlGeneratorInput, imageFolder: string): string {
  const modifiedPages = input.pages.map((page, i) => {
    if (!page.imageBase64) return page;
    const ext = page.imageBase64.startsWith("data:image/png") ? "png" : "jpg";
    return {
      ...page,
      imageBase64: `${imageFolder}/${String(i).padStart(2, "0")}.${ext}`,
    };
  });
  return generateSingleHtml({ ...input, pages: modifiedPages });
}
