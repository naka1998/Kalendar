import { describe, it, expect } from "vitest";
import { calcCropRender, clampCropRect, calcInitialCropRect } from "./cropUtils";
import type { ImageCropSettings } from "@/stores/types";

const fullCrop: ImageCropSettings = {
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
  fitMode: "cover",
};

describe("calcCropRender", () => {
  it("returns scale 1 and center position for full image crop", () => {
    const result = calcCropRender(fullCrop);
    expect(result.scaleX).toBe(1);
    expect(result.scaleY).toBe(1);
    expect(result.objectPositionX).toBe(50);
    expect(result.objectPositionY).toBe(50);
  });

  it("scales up when crop is a sub-region", () => {
    const crop: ImageCropSettings = {
      cropX: 0.25,
      cropY: 0.25,
      cropW: 0.5,
      cropH: 0.5,
      fitMode: "cover",
    };
    const result = calcCropRender(crop);
    expect(result.scaleX).toBe(2);
    expect(result.scaleY).toBe(2);
  });

  it("positions correctly for top-left crop", () => {
    const crop: ImageCropSettings = {
      cropX: 0,
      cropY: 0,
      cropW: 0.5,
      cropH: 0.5,
      fitMode: "cover",
    };
    const result = calcCropRender(crop);
    expect(result.objectPositionX).toBe(0);
    expect(result.objectPositionY).toBe(0);
  });

  it("positions correctly for bottom-right crop", () => {
    const crop: ImageCropSettings = {
      cropX: 0.5,
      cropY: 0.5,
      cropW: 0.5,
      cropH: 0.5,
      fitMode: "cover",
    };
    const result = calcCropRender(crop);
    expect(result.objectPositionX).toBe(100);
    expect(result.objectPositionY).toBe(100);
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
    // Container and image both 2:1
    const result = calcInitialCropRect(2, 2);
    expect(result.cropW).toBe(1);
    expect(result.cropH).toBe(1);
    expect(result.cropX).toBe(0);
    expect(result.cropY).toBe(0);
  });

  it("crops vertically for a wider container with tall image", () => {
    // Container 2:1, image 1:2 (tall)
    // cropAR = 2 / 0.5 = 4 → cropW=1, cropH=0.25, centered
    const result = calcInitialCropRect(2, 0.5);
    expect(result.cropW).toBe(1);
    expect(result.cropH).toBeCloseTo(0.25);
    expect(result.cropY).toBeCloseTo(0.375);
  });

  it("crops horizontally for a taller container with wide image", () => {
    // Container 1:2, image 2:1
    // cropAR = 0.5 / 2 = 0.25 → cropH=1, cropW=0.25, centered
    const result = calcInitialCropRect(0.5, 2);
    expect(result.cropH).toBe(1);
    expect(result.cropW).toBeCloseTo(0.25);
    expect(result.cropX).toBeCloseTo(0.375);
  });
});
