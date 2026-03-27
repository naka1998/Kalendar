import { CROP_MIN_SIZE } from "@/lib/constants";
import type { ImageCropSettings } from "@/stores/types";

export type AspectMode = "free" | "original" | "square";

export const ASPECT_MODE_LABELS: Record<AspectMode, string> = {
  free: "フリー",
  original: "オリジナル",
  square: "1:1",
};

export const HANDLE_CURSORS: Record<string, string> = {
  "resize-tl": "cursor-nw-resize",
  "resize-tr": "cursor-ne-resize",
  "resize-bl": "cursor-sw-resize",
  "resize-br": "cursor-se-resize",
};

export function calcImageFit(containerW: number, containerH: number, imageAspectRatio: number) {
  const containerAR = containerW / containerH;
  let imgW: number, imgH: number;
  if (imageAspectRatio > containerAR) {
    imgW = containerW;
    imgH = containerW / imageAspectRatio;
  } else {
    imgH = containerH;
    imgW = containerH * imageAspectRatio;
  }
  const imgX = (containerW - imgW) / 2;
  const imgY = (containerH - imgH) / 2;
  return { imgW, imgH, imgX, imgY };
}

export function getAspectRatio(mode: AspectMode, imageAspectRatio: number): number | null {
  if (mode === "free") return null;
  if (mode === "original") return imageAspectRatio;
  return 1; // square
}

export function adjustCropToAspect(
  crop: ImageCropSettings,
  targetAR: number | null,
  imageAspectRatio: number,
): Partial<ImageCropSettings> {
  if (targetAR === null) return {};
  const cropAR = targetAR / imageAspectRatio;
  const centerX = crop.cropX + crop.cropW / 2;
  const centerY = crop.cropY + crop.cropH / 2;

  let newW: number, newH: number;
  if (cropAR >= 1) {
    newW = Math.min(1, crop.cropW);
    newH = newW / cropAR;
    if (newH > 1) {
      newH = 1;
      newW = newH * cropAR;
    }
  } else {
    newH = Math.min(1, crop.cropH);
    newW = newH * cropAR;
    if (newW > 1) {
      newW = 1;
      newH = newW / cropAR;
    }
  }

  newW = Math.max(CROP_MIN_SIZE, newW);
  newH = Math.max(CROP_MIN_SIZE, newH);

  const newX = Math.max(0, Math.min(1 - newW, centerX - newW / 2));
  const newY = Math.max(0, Math.min(1 - newH, centerY - newH / 2));

  return { cropX: newX, cropY: newY, cropW: newW, cropH: newH };
}
