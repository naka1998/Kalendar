import type { ImageRatio } from "@/stores/types";

export interface RatioResult {
  imagePercent: number;
  gridPercent: number;
}

export function calcImageGridRatio(ratio: ImageRatio, hasImage: boolean): RatioResult {
  if (!hasImage) {
    return { imagePercent: 0, gridPercent: 100 };
  }

  const [img, grid] = ratio.split(":").map(Number);
  return { imagePercent: img, gridPercent: grid };
}
