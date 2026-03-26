import { describe, it, expect } from "vitest";
import { calcImageTransform, clampOffset, imageAlignToOffset } from "./cropUtils";
import type { ImageCropSettings } from "@/stores/types";

const defaultCrop: ImageCropSettings = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  fitMode: "contain",
};

describe("calcImageTransform", () => {
  it("returns container-matching size for contain with matching aspect ratio", () => {
    // 2:1 image in a 400x200 container (same AR) → exact fit
    const result = calcImageTransform(defaultCrop, 400, 200, 2);
    expect(result.displayW).toBeCloseTo(400);
    expect(result.displayH).toBeCloseTo(200);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });

  it("contain: wide image in tall container fills width", () => {
    // 2:1 image in 400x600 container → baseW=400, baseH=200
    const result = calcImageTransform(defaultCrop, 400, 600, 2);
    expect(result.displayW).toBeCloseTo(400);
    expect(result.displayH).toBeCloseTo(200);
    expect(result.tx).toBe(0);
    expect(result.ty).toBe(0);
  });

  it("cover: wide image in tall container fills height", () => {
    const crop = { ...defaultCrop, fitMode: "cover" as const };
    // 2:1 image in 400x600 container → baseW=1200, baseH=600
    const result = calcImageTransform(crop, 400, 600, 2);
    expect(result.displayW).toBeCloseTo(1200);
    expect(result.displayH).toBeCloseTo(600);
  });

  it("offset moves image within movable range", () => {
    // contain: 2:1 image in 400x600 → baseW=400, baseH=200
    // maxTy = |200-600|/2 = 200
    const crop = { ...defaultCrop, offsetY: -1 };
    const result = calcImageTransform(crop, 400, 600, 2);
    expect(result.ty).toBeCloseTo(-200);
  });

  it("offset +1 moves to other end", () => {
    const crop = { ...defaultCrop, offsetY: 1 };
    const result = calcImageTransform(crop, 400, 600, 2);
    expect(result.ty).toBeCloseTo(200);
  });

  it("scale increases display size proportionally", () => {
    const crop = { ...defaultCrop, scale: 2 };
    const result = calcImageTransform(crop, 400, 600, 2);
    // baseW=400, baseH=200, scaled: 800, 400
    expect(result.displayW).toBeCloseTo(800);
    expect(result.displayH).toBeCloseTo(400);
  });

  it("cover with scale=1 and offset=-1 shows top edge", () => {
    // 1:2 image (tall) in 400x400 container
    // cover: baseW=400, baseH=800. maxTy = |800-400|/2 = 200
    const crop = { ...defaultCrop, fitMode: "cover" as const, offsetY: -1 };
    const result = calcImageTransform(crop, 400, 400, 0.5);
    expect(result.ty).toBeCloseTo(-200);
  });
});

describe("clampOffset", () => {
  it("clamps within -1 to 1", () => {
    expect(clampOffset(0)).toBe(0);
    expect(clampOffset(-2)).toBe(-1);
    expect(clampOffset(2)).toBe(1);
    expect(clampOffset(0.5)).toBe(0.5);
  });
});

describe("imageAlignToOffset", () => {
  it("maps start to -1", () => {
    expect(imageAlignToOffset("start")).toBe(-1);
  });
  it("maps center to 0", () => {
    expect(imageAlignToOffset("center")).toBe(0);
  });
  it("maps end to 1", () => {
    expect(imageAlignToOffset("end")).toBe(1);
  });
});
