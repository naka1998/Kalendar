import type { PageData, ImagePosition } from "@/stores/types";
import { isHorizontalLayout } from "../layoutUtils";
import { escapeHtml } from "../htmlUtils";
import { renderGridHtml } from "./gridRenderer";
import { calcCropRender } from "../cropUtils";

function objectPositionValue(align: string | undefined): string {
  if (align === "start") return "top";
  if (align === "end") return "bottom";
  return "center";
}

// Page dimensions in mm for export rendering
const PAGE_W_MM = { portrait: 210, landscape: 297 };
const PAGE_H_MM = { portrait: 297, landscape: 210 };

function renderImageHtml(
  page: PageData,
  sizeProperty: string,
  sizeValue: string,
  imageAlign: string | undefined,
  containerWMm: number,
  containerHMm: number,
): string {
  const crop = page.imageCropSettings;
  const aspectRatio = page.imageAspectRatio;

  if (crop && aspectRatio) {
    const fitMode = page.imageFitMode ?? "cover";
    const r = calcCropRender(crop, containerWMm, containerHMm, aspectRatio, fitMode);
    // Use percentage-based sizing relative to container
    const leftPct = (r.imgLeft / containerWMm) * 100;
    const topPct = (r.imgTop / containerHMm) * 100;
    const widthPct = (r.imgWidth / containerWMm) * 100;
    const heightPct = (r.imgHeight / containerHMm) * 100;
    return `<div style="${sizeProperty}:${sizeValue};position:relative;overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="position:absolute;left:${leftPct.toFixed(4)}%;top:${topPct.toFixed(4)}%;width:${widthPct.toFixed(4)}%;height:${heightPct.toFixed(4)}%" /></div>`;
  }

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

  // Calculate container dimensions in mm for crop rendering
  const orient = orientation === "landscape" ? "landscape" : "portrait";
  const fullW = PAGE_W_MM[orient];
  const fullH = PAGE_H_MM[orient];
  const containerWMm = horizontal ? (fullW * imgPct) / 100 : fullW;
  const containerHMm = horizontal ? fullH : (fullH * imgPct) / 100;

  let contentHtml: string;

  if (page.imageBase64) {
    const gridHtml = renderGridHtml(page);
    const imageBlock = renderImageHtml(
      page,
      sizeProperty,
      `${imgPct}%`,
      calendarStyle?.imageAlign,
      containerWMm,
      containerHMm,
    );
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
