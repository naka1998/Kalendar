import type { ContentAlign, HtmlGeneratorInput, PageData, ImagePosition } from "@/stores/types";
import { isHorizontalLayout } from "../layoutUtils";
import { escapeHtml } from "../htmlUtils";
import { renderGridHtml } from "./gridRenderer";
import { calcCropRender, isFullImageCrop } from "../cropUtils";
import { objectPositionValue, justifyContentValue, alignItemsValue } from "../alignmentUtils";

// Page dimensions in mm for export rendering
const PAGE_W_MM = { portrait: 210, landscape: 297 };
const PAGE_H_MM = { portrait: 297, landscape: 210 };

function renderImageHtml(
  page: PageData,
  sizeProperty: string,
  sizeValue: string,
  imageAlignV: string | undefined,
  imageAlignH: string | undefined,
  containerWMm: number,
  containerHMm: number,
): string {
  const crop = page.imageCropSettings;
  const aspectRatio = page.imageAspectRatio;

  const userFitMode = page.imageFitMode;
  if (crop && aspectRatio && !isFullImageCrop(crop) && userFitMode !== "none") {
    const fitMode = userFitMode ?? "cover";
    const aH = (imageAlignH as ContentAlign) ?? "center";
    const aV = (imageAlignV as ContentAlign) ?? "center";
    const r = calcCropRender(crop, containerWMm, containerHMm, aspectRatio, fitMode, aH, aV);
    return `<div style="${sizeProperty}:${sizeValue};position:relative;overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="position:absolute;left:${r.imgLeftPct.toFixed(4)}%;top:${r.imgTopPct.toFixed(4)}%;width:${r.imgWidthPct.toFixed(4)}%;height:${r.imgHeightPct.toFixed(4)}%" /></div>`;
  }

  const op = objectPositionValue(imageAlignV, imageAlignH);
  const fitMode = userFitMode ?? "contain";
  // Container alignment: align-items = vertical, justify-content = horizontal (flex row)
  const containerAlign = `align-items:${alignItemsValue(imageAlignV)};justify-content:${justifyContentValue(imageAlignH)}`;

  if (fitMode === "fit-width") {
    // Width fills container, container flex handles vertical alignment
    return `<div style="${sizeProperty}:${sizeValue};display:flex;${containerAlign};overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="width:100%" /></div>`;
  }
  if (fitMode === "fit-height") {
    // Height fills container, container flex handles horizontal alignment
    return `<div style="${sizeProperty}:${sizeValue};display:flex;${containerAlign};overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="height:100%" /></div>`;
  }
  if (fitMode === "none") {
    // Element fills container, content at natural size, object-position controls alignment
    return `<div style="${sizeProperty}:${sizeValue};display:flex;${containerAlign};overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="width:100%;height:100%;object-fit:none;object-position:${op}" /></div>`;
  }

  // cover/contain: element fills container, object-fit + object-position handle alignment
  return `<div style="${sizeProperty}:${sizeValue};display:flex;${containerAlign};overflow:hidden"><img src="${escapeHtml(page.imageBase64!)}" style="width:100%;height:100%;object-fit:${fitMode};object-position:${op}" /></div>`;
}

function renderGridContainer(
  gridHtml: string,
  sizeProperty: string,
  sizeValue: string,
  contentAlignV?: string,
  contentAlignH?: string,
): string {
  const justify = `justify-content:${justifyContentValue(contentAlignV)}`;
  const align = `align-items:${alignItemsValue(contentAlignH)}`;
  return `<div style="${sizeProperty}:${sizeValue};display:flex;flex-direction:column;${justify};${align};padding:16px 24px;overflow:hidden">${gridHtml}</div>`;
}

export function renderPage(
  page: PageData,
  orientation: string,
  fontFamily: string,
  fontWeight: number,
  calendarStyle?: HtmlGeneratorInput["calendarStyle"],
): string {
  const { colors } = page.theme;
  const width = orientation === "portrait" ? "210mm" : "297mm";
  const height = orientation === "portrait" ? "297mm" : "210mm";

  const position: ImagePosition = page.imagePosition;
  const horizontal = isHorizontalLayout(position);
  const imgPct = page.imagePercent;
  const gridPct = 100 - imgPct;
  const sizeProperty = horizontal ? "width" : "height";
  const marginTopPx = calendarStyle?.pageMarginTop ?? 0;
  const marginTop = marginTopPx ? `padding-top:${marginTopPx}px;` : "";

  // Calculate container dimensions in mm for crop rendering
  const orient = orientation === "landscape" ? "landscape" : "portrait";
  const fullW = PAGE_W_MM[orient];
  const contentHeightMm = PAGE_H_MM[orient] - (marginTopPx * 25.4) / 96;
  const containerWMm = horizontal ? (fullW * imgPct) / 100 : fullW;
  const containerHMm = horizontal ? contentHeightMm : (contentHeightMm * imgPct) / 100;

  let contentHtml: string;

  const gridWidthPct = calendarStyle?.gridWidth ?? 100;
  const gridStyle = {
    layoutPreset: calendarStyle?.layoutPreset,
    titlePosition: calendarStyle?.titlePosition,
    titleOrder: calendarStyle?.titleOrder,
    titleRule: calendarStyle?.titleRule,
    weekdayAlign: calendarStyle?.weekdayAlign,
    dayRuleH: calendarStyle?.dayRuleH,
    dayRuleV: calendarStyle?.dayRuleV,
    dayAlignH: calendarStyle?.dayAlignH,
    dayAlignV: calendarStyle?.dayAlignV,
    monthFontSize: calendarStyle?.monthFontSize,
    dayFontSize: calendarStyle?.dayFontSize,
    weekdayFontSize: calendarStyle?.weekdayFontSize,
    cellPadding: calendarStyle?.cellPadding,
    headerGap: calendarStyle?.headerGap,
  };

  if (page.imageBase64) {
    const gridHtml = renderGridHtml(page, gridWidthPct, gridStyle);
    const imageBlock = renderImageHtml(
      page,
      sizeProperty,
      `${imgPct}%`,
      calendarStyle?.imageAlignV,
      calendarStyle?.imageAlignH,
      containerWMm,
      containerHMm,
    );
    const gridBlock = renderGridContainer(
      gridHtml,
      sizeProperty,
      `${gridPct}%`,
      calendarStyle?.contentAlignV,
      calendarStyle?.contentAlignH,
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
    const gridHtml = renderGridHtml(page, gridWidthPct, gridStyle);
    contentHtml = `<div style="height:100%;padding:24px;">${gridHtml}</div>`;
  }

  return `<div class="page" style="width:${width};height:${height};${marginTop}background:${colors.background};page-break-after:always;position:relative;overflow:hidden;font-family:'${escapeHtml(fontFamily)}',sans-serif;font-weight:${fontWeight}">${contentHtml}</div>`;
}
