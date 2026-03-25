import type { PageData, ImagePosition } from "@/stores/types";
import { isHorizontalLayout } from "../layoutUtils";
import { escapeHtml } from "../htmlUtils";
import { renderGridHtml } from "./gridRenderer";

function objectPositionValue(align: string | undefined): string {
  if (align === "start") return "top";
  if (align === "end") return "bottom";
  return "center";
}

function renderImageHtml(
  page: PageData,
  sizeProperty: string,
  sizeValue: string,
  imageAlign?: string,
): string {
  const op = objectPositionValue(imageAlign);
  return `<div style="${sizeProperty}:${sizeValue};display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="width:100%;height:100%;object-fit:contain;object-position:${op}" /></div>`;
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

export function renderPage(
  page: PageData,
  orientation: string,
  fontFamily: string,
  fontWeight: number,
  calendarStyle?: Partial<{ contentAlign: string; imageAlign: string; pageMarginTop: number }>,
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
    const imageBlock = renderImageHtml(page, sizeProperty, `${imgPct}%`, calendarStyle?.imageAlign);
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
