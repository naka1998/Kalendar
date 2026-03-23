import type { ImagePosition } from "@/stores/types";

export interface RatioResult {
  imagePercent: number;
  gridPercent: number;
}

export function calcLayoutPercent(imagePercent: number, hasImage: boolean): RatioResult {
  if (!hasImage) {
    return { imagePercent: 0, gridPercent: 100 };
  }

  return { imagePercent, gridPercent: 100 - imagePercent };
}

export function isHorizontalLayout(position: ImagePosition): boolean {
  return position === "left" || position === "right";
}
