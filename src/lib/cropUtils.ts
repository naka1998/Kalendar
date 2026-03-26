import type { ImageCropSettings } from "@/stores/types";
import type { FitMode } from "@/stores/types";
import { CROP_MIN_SIZE } from "./constants";

export interface CropRenderResult {
  // All values as percentages of the container dimensions
  imgWidthPct: number;
  imgHeightPct: number;
  imgLeftPct: number;
  imgTopPct: number;
}

/**
 * Calculate CSS rendering properties for a cropped image.
 * Returns percentage-based values relative to the container, so the result
 * is independent of the actual container pixel dimensions.
 *
 * Only the container's aspect ratio matters (via containerW/containerH ratio).
 */
export function calcCropRender(
  crop: ImageCropSettings,
  containerW: number,
  containerH: number,
  imageAspectRatio: number,
  fitMode: FitMode,
): CropRenderResult {
  // The crop region's real-world aspect ratio
  const cropRealAR = (crop.cropW * imageAspectRatio) / crop.cropH;
  const containerAR = containerW / containerH;

  // How the crop region fits the container (as fractions of container dimensions)
  let displayCropWRatio: number;
  let displayCropHRatio: number;

  if (fitMode === "cover") {
    if (cropRealAR > containerAR) {
      // Crop is wider: match height, overflow width
      displayCropHRatio = 1;
      displayCropWRatio = cropRealAR / containerAR;
    } else {
      // Crop is taller: match width, overflow height
      displayCropWRatio = 1;
      displayCropHRatio = containerAR / cropRealAR;
    }
  } else {
    // contain
    if (cropRealAR > containerAR) {
      // Crop is wider: match width, fit height within
      displayCropWRatio = 1;
      displayCropHRatio = containerAR / cropRealAR;
    } else {
      // Crop is taller: match height, fit width within
      displayCropHRatio = 1;
      displayCropWRatio = cropRealAR / containerAR;
    }
  }

  // Full image dimensions as fractions of container
  const imgWidthRatio = displayCropWRatio / crop.cropW;
  const imgHeightRatio = displayCropHRatio / crop.cropH;

  // Position: center the crop region in the container
  const cropCenterXRatio = (crop.cropX + crop.cropW / 2) * imgWidthRatio;
  const cropCenterYRatio = (crop.cropY + crop.cropH / 2) * imgHeightRatio;
  const imgLeftRatio = 0.5 - cropCenterXRatio;
  const imgTopRatio = 0.5 - cropCenterYRatio;

  return {
    imgWidthPct: imgWidthRatio * 100,
    imgHeightPct: imgHeightRatio * 100,
    imgLeftPct: imgLeftRatio * 100,
    imgTopPct: imgTopRatio * 100,
  };
}

/**
 * Clamp a crop rect to stay within image bounds [0, 1] and enforce minimum size.
 */
export function clampCropRect(
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
): { cropX: number; cropY: number; cropW: number; cropH: number } {
  const w = Math.max(CROP_MIN_SIZE, Math.min(1, cropW));
  const h = Math.max(CROP_MIN_SIZE, Math.min(1, cropH));
  const x = Math.max(0, Math.min(1 - w, cropX));
  const y = Math.max(0, Math.min(1 - h, cropY));
  return { cropX: x, cropY: y, cropW: w, cropH: h };
}

/**
 * Calculate the initial crop rect for a given container and image aspect ratio.
 * The crop rect has the same aspect ratio as the container, centered on the image.
 */
export function calcInitialCropRect(
  containerAR: number,
  imageAspectRatio: number,
): { cropX: number; cropY: number; cropW: number; cropH: number } {
  const cropAR = containerAR / imageAspectRatio;

  let cropW: number, cropH: number;
  if (cropAR >= 1) {
    cropW = 1;
    cropH = Math.min(1, 1 / cropAR);
  } else {
    cropH = 1;
    cropW = Math.min(1, cropAR);
  }

  const cropX = (1 - cropW) / 2;
  const cropY = (1 - cropH) / 2;

  return { cropX, cropY, cropW, cropH };
}
