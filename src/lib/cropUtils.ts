import type { ImageCropSettings } from "@/stores/types";
import type { ContentAlign, FitMode } from "@/stores/types";
import { CROP_MIN_SIZE } from "./constants";

export interface CropRenderResult {
  // All values as percentages of the container dimensions
  imgWidthPct: number;
  imgHeightPct: number;
  imgLeftPct: number;
  imgTopPct: number;
}

/**
 * Check if a crop rect represents the full image (no actual cropping).
 * Uses a small epsilon to handle floating point imprecision.
 */
export function isFullImageCrop(crop: ImageCropSettings): boolean {
  return crop.cropX <= 0.001 && crop.cropY <= 0.001 && crop.cropW >= 0.999 && crop.cropH >= 0.999;
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
  alignH: ContentAlign = "center",
  alignV: ContentAlign = "center",
): CropRenderResult {
  // The crop region's real-world aspect ratio
  const cropRealAR = (crop.cropW * imageAspectRatio) / crop.cropH;
  const containerAR = containerW / containerH;

  // How the crop region fits the container (as fractions of container dimensions)
  let displayCropWRatio: number;
  let displayCropHRatio: number;

  if (fitMode === "cover") {
    if (cropRealAR > containerAR) {
      displayCropHRatio = 1;
      displayCropWRatio = cropRealAR / containerAR;
    } else {
      displayCropWRatio = 1;
      displayCropHRatio = containerAR / cropRealAR;
    }
  } else if (fitMode === "none") {
    // Display at original pixel size relative to container
    // cropW fraction of original image width / containerW gives the ratio
    // Since we don't have actual pixel sizes here, treat as contain (best approximation)
    if (cropRealAR > containerAR) {
      displayCropWRatio = 1;
      displayCropHRatio = containerAR / cropRealAR;
    } else {
      displayCropHRatio = 1;
      displayCropWRatio = cropRealAR / containerAR;
    }
  } else if (fitMode === "fit-width") {
    // Match width, let height be natural
    displayCropWRatio = 1;
    displayCropHRatio = containerAR / cropRealAR;
  } else if (fitMode === "fit-height") {
    // Match height, let width be natural
    displayCropHRatio = 1;
    displayCropWRatio = cropRealAR / containerAR;
  } else {
    // contain (default)
    if (cropRealAR > containerAR) {
      displayCropWRatio = 1;
      displayCropHRatio = containerAR / cropRealAR;
    } else {
      displayCropHRatio = 1;
      displayCropWRatio = cropRealAR / containerAR;
    }
  }

  // Full image dimensions as fractions of container
  const imgWidthRatio = displayCropWRatio / crop.cropW;
  const imgHeightRatio = displayCropHRatio / crop.cropH;

  // Position: align the crop region within the container using anchor points
  // anchor: start=0, center=0.5, end=1.0
  const anchorX = alignH === "start" ? 0 : alignH === "end" ? 1 : 0.5;
  const anchorY = alignV === "start" ? 0 : alignV === "end" ? 1 : 0.5;
  const cropAnchorX = (crop.cropX + anchorX * crop.cropW) * imgWidthRatio;
  const cropAnchorY = (crop.cropY + anchorY * crop.cropH) * imgHeightRatio;
  const imgLeftRatio = anchorX - cropAnchorX;
  const imgTopRatio = anchorY - cropAnchorY;

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
