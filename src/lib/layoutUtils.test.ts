import { describe, it, expect } from "vitest";
import { calcImageGridRatio } from "./layoutUtils";

describe("calcImageGridRatio", () => {
  it("returns 60:40 split", () => {
    expect(calcImageGridRatio("60:40", true)).toEqual({
      imagePercent: 60,
      gridPercent: 40,
    });
  });

  it("returns 50:50 split", () => {
    expect(calcImageGridRatio("50:50", true)).toEqual({
      imagePercent: 50,
      gridPercent: 50,
    });
  });

  it("returns 70:30 split", () => {
    expect(calcImageGridRatio("70:30", true)).toEqual({
      imagePercent: 70,
      gridPercent: 30,
    });
  });

  it("returns 0:100 when no image", () => {
    expect(calcImageGridRatio("60:40", false)).toEqual({
      imagePercent: 0,
      gridPercent: 100,
    });
  });
});
