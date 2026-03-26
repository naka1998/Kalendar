import type { ImageCropSettings } from "@/stores/types";
import { CROP_MIN_SIZE } from "./constants";

export interface CropRenderResult {
  // CSS object-position values as percentages
  objectPositionX: number; // %
  objectPositionY: number; // %
  // CSS object-fit scale factor (how much to enlarge to show only the cropped region)
  scaleX: number;
  scaleY: number;
}

/**
 * Calculate CSS rendering properties for a cropped image.
 *
 * The crop rect (cropX, cropY, cropW, cropH) defines a sub-region of the
 * original image in normalized coordinates (0-1). To display only that region
 * in a container, we:
 * 1. Scale the image up so the crop region fills the container
 * 2. Position the image so the crop region is centered in the container
 */
export function calcCropRender(crop: ImageCropSettings): CropRenderResult {
  const scaleX = 1 / crop.cropW;
  const scaleY = 1 / crop.cropH;

  // object-position: the center of the crop rect, in percentage of the image
  const centerX = crop.cropX + crop.cropW / 2;
  const centerY = crop.cropY + crop.cropH / 2;

  // Convert center to object-position percentage
  // object-position 0% = left edge aligned, 100% = right edge aligned
  // For the cropped region center to align with the container center:
  const objectPositionX =
    crop.cropW < 1 ? ((centerX - crop.cropW / 2) / (1 - crop.cropW)) * 100 : 50;
  const objectPositionY =
    crop.cropH < 1 ? ((centerY - crop.cropH / 2) / (1 - crop.cropH)) * 100 : 50;

  return { objectPositionX, objectPositionY, scaleX, scaleY };
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
  // The crop rect aspect ratio should match the container
  // cropW / cropH (in image-relative coords) * imageAspectRatio = containerAR
  // So: cropW / cropH = containerAR / imageAspectRatio

  const cropAR = containerAR / imageAspectRatio;

  let cropW: number, cropH: number;
  if (cropAR >= 1) {
    // Crop is wider than tall (in image coords) — use full width
    cropW = 1;
    cropH = Math.min(1, 1 / cropAR);
  } else {
    // Crop is taller than wide — use full height
    cropH = 1;
    cropW = Math.min(1, cropAR);
  }

  // Center the crop rect
  const cropX = (1 - cropW) / 2;
  const cropY = (1 - cropH) / 2;

  return { cropX, cropY, cropW, cropH };
}
