import type { ContentAlign } from "@/stores/types";

/** Convert ContentAlign to CSS object-position keyword (vertical axis) */
export function alignToPositionV(align: ContentAlign | string | undefined): string {
  if (align === "start") return "top";
  if (align === "end") return "bottom";
  return "center";
}

/** Convert ContentAlign to CSS object-position keyword (horizontal axis) */
export function alignToPositionH(align: ContentAlign | string | undefined): string {
  if (align === "start") return "left";
  if (align === "end") return "right";
  return "center";
}

/** Build CSS object-position value from vertical and horizontal alignment */
export function objectPositionValue(
  alignV: ContentAlign | string | undefined,
  alignH: ContentAlign | string | undefined,
): string {
  return `${alignToPositionV(alignV)} ${alignToPositionH(alignH)}`;
}

/** Convert ContentAlign to CSS justify-content value */
export function justifyContentValue(align: ContentAlign | string | undefined): string {
  if (align === "start") return "flex-start";
  if (align === "end") return "flex-end";
  return "center";
}

/** Convert ContentAlign to CSS align-items value */
export function alignItemsValue(align: ContentAlign | string | undefined): string {
  if (align === "start") return "flex-start";
  if (align === "end") return "flex-end";
  return "center";
}

/** Convert ContentAlign to Tailwind justify-content class */
export function justifyContentClass(align: ContentAlign | undefined): string {
  if (align === "start") return "justify-start";
  if (align === "end") return "justify-end";
  return "justify-center";
}

/** Convert ContentAlign to Tailwind align-items class */
export function alignItemsClass(align: ContentAlign | undefined): string {
  if (align === "start") return "items-start";
  if (align === "end") return "items-end";
  return "items-center";
}
