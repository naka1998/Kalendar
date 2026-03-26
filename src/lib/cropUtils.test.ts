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
  it("full crop in cover mode fills the container", () => {
    // 2:1 image in a 400x400 container, cover mode
    const result = calcCropRender(fullCrop, 400, 400, 2, "cover");
    // Cover: image wider than container, so fill height, overflow width
    expect(result.imgHeight).toBeCloseTo(400);
    expect(result.imgWidth).toBeCloseTo(800);
  });

  it("full crop in contain mode fits within container", () => {
    // 2:1 image in a 400x400 container, contain mode
    const result = calcCropRender(fullCrop, 400, 400, 2, "contain");
    // Contain: fit width, height is smaller
    expect(result.imgWidth).toBeCloseTo(400);
    expect(result.imgHeight).toBeCloseTo(200);
  });

  it("contain mode with tall crop shows margins", () => {
    // 2:1 image, crop the left half (tall crop)
    // Crop real AR = 0.5 * 2 / 1.0 = 1.0 (square crop)
    const crop: ImageCropSettings = { cropX: 0, cropY: 0, cropW: 0.5, cropH: 1 };
    // 400x200 container, contain mode
    const result = calcCropRender(crop, 400, 200, 2, "contain");
    // Crop is square (AR=1), container is 2:1
    // Contain: fit height → displayCropH=200, displayCropW=200
    // Full image width = 200 / 0.5 = 400, height = 200 / 1.0 = 200
    expect(result.imgHeight).toBeCloseTo(200);
    expect(result.imgWidth).toBeCloseTo(400);
  });

  it("vertical crop in contain mode leaves horizontal margins", () => {
    // 1:1 image, crop a vertical strip (tall crop)
    const crop: ImageCropSettings = { cropX: 0.25, cropY: 0, cropW: 0.5, cropH: 1 };
    // 400x400 container, contain mode
    // Crop real AR = (0.5 * 1) / 1.0 = 0.5 (tall)
    // Contain: fit height → displayCropH=400, displayCropW=200
    // Full img: width=200/0.5=400, height=400/1.0=400
    const result = calcCropRender(crop, 400, 400, 1, "contain");
    // The crop region (200px wide) should be centered in 400px container
    // → 100px margin on each side
    expect(result.imgWidth).toBeCloseTo(400);
    expect(result.imgHeight).toBeCloseTo(400);
    // crop center at X = (0.25 + 0.25) * 400 = 200
    // imgLeft = 200 - 200 = 0
    // So the full image starts at left=0, and the crop (from 100 to 300) is centered
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
