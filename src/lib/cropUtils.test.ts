import { describe, it, expect } from "vitest";
import { calcCropRender, clampCropRect, calcInitialCropRect } from "./cropUtils";
import type { ImageCropSettings } from "@/stores/types";

const fullCrop: ImageCropSettings = {
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
};

describe("calcCropRender", () => {
  it("full crop in cover mode returns 100% dimensions", () => {
    // 2:1 image in a 400x400 container, cover mode
    // cropRealAR = 2, containerAR = 1 → crop wider: match height, overflow width
    const result = calcCropRender(fullCrop, 400, 400, 2, "cover");
    expect(result.imgHeightPct).toBeCloseTo(100);
    expect(result.imgWidthPct).toBeCloseTo(200); // 2:1 image covers 1:1 container
  });

  it("full crop in contain mode fits within container", () => {
    // 2:1 image in a 400x400 container, contain mode
    const result = calcCropRender(fullCrop, 400, 400, 2, "contain");
    expect(result.imgWidthPct).toBeCloseTo(100);
    expect(result.imgHeightPct).toBeCloseTo(50); // 2:1 image contained in 1:1 container
  });

  it("cover mode with matching AR gives exactly 100% x 100%", () => {
    // 2:1 image, full crop, 2:1 container
    const result = calcCropRender(fullCrop, 400, 200, 2, "cover");
    expect(result.imgWidthPct).toBeCloseTo(100);
    expect(result.imgHeightPct).toBeCloseTo(100);
    expect(result.imgLeftPct).toBeCloseTo(0);
    expect(result.imgTopPct).toBeCloseTo(0);
  });

  it("half-width crop in cover mode scales up to fill", () => {
    // 2:1 image, crop left half: cropW=0.5, 2:1 container
    // Crop real AR = (0.5 * 2) / 1 = 1.0
    // Container AR = 2
    // Cover: crop taller → match width, overflow height
    // displayCropWRatio = 1, displayCropHRatio = 2/1 = 2
    // imgWidthRatio = 1/0.5 = 2, imgHeightRatio = 2/1 = 2
    const crop: ImageCropSettings = { cropX: 0, cropY: 0, cropW: 0.5, cropH: 1 };
    const result = calcCropRender(crop, 400, 200, 2, "cover");
    expect(result.imgWidthPct).toBeCloseTo(200);
    expect(result.imgHeightPct).toBeCloseTo(200);
  });

  it("contain mode with tall crop shows margins", () => {
    // 1:1 image, vertical strip crop: cropW=0.5, cropH=1
    // Crop real AR = (0.5*1)/1 = 0.5, container 400x400 (AR=1)
    // Contain: crop taller → match height, displayCropHRatio=1, displayCropWRatio=0.5/1=0.5
    const crop: ImageCropSettings = { cropX: 0.25, cropY: 0, cropW: 0.5, cropH: 1 };
    const result = calcCropRender(crop, 400, 400, 1, "contain");
    expect(result.imgHeightPct).toBeCloseTo(100);
    // Image fills height but width is 50% of container → margins on sides
    expect(result.imgWidthPct).toBeCloseTo(100); // full image width = container width
  });

  it("crop position is centered correctly", () => {
    // 1:1 image, bottom-right quarter crop
    const crop: ImageCropSettings = { cropX: 0.5, cropY: 0.5, cropW: 0.5, cropH: 0.5 };
    // 1:1 container, cover mode, crop AR = 1 = container AR
    const result = calcCropRender(crop, 400, 400, 1, "cover");
    // imgWidthPct = 200%, imgHeightPct = 200% (2x scale to make 50% crop fill container)
    expect(result.imgWidthPct).toBeCloseTo(200);
    expect(result.imgHeightPct).toBeCloseTo(200);
    // Crop center at (0.75, 0.75) in image space
    // imgLeft = 50 - 0.75*200 = 50 - 150 = -100%
    expect(result.imgLeftPct).toBeCloseTo(-100);
    expect(result.imgTopPct).toBeCloseTo(-100);
  });
});

describe("clampCropRect", () => {
  it("clamps within bounds", () => {
    const result = clampCropRect(-0.1, -0.1, 0.5, 0.5);
    expect(result.cropX).toBe(0);
    expect(result.cropY).toBe(0);
  });

  it("clamps so rect stays inside image", () => {
    const result = clampCropRect(0.8, 0.8, 0.5, 0.5);
    expect(result.cropX).toBe(0.5);
    expect(result.cropY).toBe(0.5);
  });

  it("enforces minimum size", () => {
    const result = clampCropRect(0, 0, 0.01, 0.01);
    expect(result.cropW).toBe(0.1);
    expect(result.cropH).toBe(0.1);
  });
});

describe("calcInitialCropRect", () => {
  it("returns full image for matching aspect ratios", () => {
    const result = calcInitialCropRect(2, 2);
    expect(result.cropW).toBe(1);
    expect(result.cropH).toBe(1);
    expect(result.cropX).toBe(0);
    expect(result.cropY).toBe(0);
  });

  it("crops vertically for a wider container with tall image", () => {
    const result = calcInitialCropRect(2, 0.5);
    expect(result.cropW).toBe(1);
    expect(result.cropH).toBeCloseTo(0.25);
    expect(result.cropY).toBeCloseTo(0.375);
  });

  it("crops horizontally for a taller container with wide image", () => {
    const result = calcInitialCropRect(0.5, 2);
    expect(result.cropH).toBe(1);
    expect(result.cropW).toBeCloseTo(0.25);
    expect(result.cropX).toBeCloseTo(0.375);
  });
});
