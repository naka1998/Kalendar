import type { ContentAlign, FitMode, ImageCropSettings } from "@/stores/types";

export interface ImageTransformResult {
  displayW: number;
  displayH: number;
  tx: number;
  ty: number;
}

function calcBaseSize(
  fitMode: FitMode,
  containerW: number,
  containerH: number,
  imageAspectRatio: number,
): { baseW: number; baseH: number } {
  const containerAR = containerW / containerH;

  if (fitMode === "cover") {
    if (imageAspectRatio > containerAR) {
      // Image is wider: match height, overflow width
      return { baseW: containerH * imageAspectRatio, baseH: containerH };
    }
    // Image is taller: match width, overflow height
    return { baseW: containerW, baseH: containerW / imageAspectRatio };
  }

  // contain
  if (imageAspectRatio > containerAR) {
    // Image is wider: match width, fit height within
    return { baseW: containerW, baseH: containerW / imageAspectRatio };
  }
  // Image is taller: match height, fit width within
  return { baseW: containerH * imageAspectRatio, baseH: containerH };
}

export function calcImageTransform(
  crop: ImageCropSettings,
  containerW: number,
  containerH: number,
  imageAspectRatio: number,
): ImageTransformResult {
  const { baseW, baseH } = calcBaseSize(crop.fitMode, containerW, containerH, imageAspectRatio);
  const displayW = baseW * crop.scale;
  const displayH = baseH * crop.scale;

  const maxTx = Math.abs(displayW - containerW) / 2;
  const maxTy = Math.abs(displayH - containerH) / 2;

  const tx = crop.offsetX * maxTx;
  const ty = crop.offsetY * maxTy;

  return { displayW, displayH, tx, ty };
}

export function clampOffset(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

export function imageAlignToOffset(align: ContentAlign): number {
  if (align === "start") return -1;
  if (align === "end") return 1;
  return 0;
}
