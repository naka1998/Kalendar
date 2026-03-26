import type { ImageCropSettings } from "@/stores/types";
import type { FitMode } from "@/stores/types";
import { CROP_MIN_SIZE } from "./constants";

export interface CropRenderResult {
  // Image element dimensions in px (relative to container)
  imgWidth: number;
  imgHeight: number;
  // Image element position offset in px (relative to container center)
  imgLeft: number;
  imgTop: number;
}

/**
 * Calculate the absolute position and size of an image element to display
 * only the cropped region within a container, respecting fitMode.
 *
 * The approach: enlarge the full image so that the crop region exactly fills
 * (or fits within) the container, then offset it so the crop region is centered.
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

  // Determine how the crop region fits into the container
  let displayCropW: number, displayCropH: number;
  if (fitMode === "cover") {
    // Crop region fills the container (may overflow)
    if (cropRealAR > containerAR) {
      displayCropH = containerH;
      displayCropW = containerH * cropRealAR;
    } else {
      displayCropW = containerW;
      displayCropH = containerW / cropRealAR;
    }
  } else {
    // Crop region fits within the container (may have margins)
    if (cropRealAR > containerAR) {
      displayCropW = containerW;
      displayCropH = containerW / cropRealAR;
    } else {
      displayCropH = containerH;
      displayCropW = containerH * cropRealAR;
    }
  }

  // Scale factor: how much to enlarge the full image
  // so that the crop region becomes displayCropW x displayCropH
  const scaleX = displayCropW / crop.cropW;
  const scaleY = displayCropH / crop.cropH;
  // Use uniform scale (they should be equal if crop is proportional to image)
  const imgWidth = scaleX; // full image width = scaleX * 1 (normalized)
  const imgHeight = scaleY; // full image height = scaleY * 1 (normalized)

  // Position: center the crop region in the container
  // The crop region starts at (cropX * imgWidth, cropY * imgHeight) within the full image
  // We want the crop region center to be at the container center
  const cropCenterInImgX = (crop.cropX + crop.cropW / 2) * imgWidth;
  const cropCenterInImgY = (crop.cropY + crop.cropH / 2) * imgHeight;
  const imgLeft = containerW / 2 - cropCenterInImgX;
  const imgTop = containerH / 2 - cropCenterInImgY;

  return { imgWidth, imgHeight, imgLeft, imgTop };
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
