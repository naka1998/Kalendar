import { describe, it, expect } from "vitest";
import { calcLayoutPercent, isHorizontalLayout } from "./layoutUtils";

describe("calcLayoutPercent", () => {
  it("returns given percent when image is present", () => {
    expect(calcLayoutPercent(60, true)).toEqual({
      imagePercent: 60,
      gridPercent: 40,
    });
  });

  it("returns 50:50 split", () => {
    expect(calcLayoutPercent(50, true)).toEqual({
      imagePercent: 50,
      gridPercent: 50,
    });
  });

  it("returns 30:70 split", () => {
    expect(calcLayoutPercent(30, true)).toEqual({
      imagePercent: 30,
      gridPercent: 70,
    });
  });

  it("returns 0:100 when no image", () => {
    expect(calcLayoutPercent(60, false)).toEqual({
      imagePercent: 0,
      gridPercent: 100,
    });
  });

  it("handles boundary value 20", () => {
    expect(calcLayoutPercent(20, true)).toEqual({
      imagePercent: 20,
      gridPercent: 80,
    });
  });

  it("handles boundary value 80", () => {
    expect(calcLayoutPercent(80, true)).toEqual({
      imagePercent: 80,
      gridPercent: 20,
    });
  });
});

describe("isHorizontalLayout", () => {
  it("returns false for top", () => {
    expect(isHorizontalLayout("top")).toBe(false);
  });

  it("returns false for bottom", () => {
    expect(isHorizontalLayout("bottom")).toBe(false);
  });

  it("returns true for left", () => {
    expect(isHorizontalLayout("left")).toBe(true);
  });

  it("returns true for right", () => {
    expect(isHorizontalLayout("right")).toBe(true);
  });
});
