import { describe, it, expect } from "vitest";
import { FONT_PRESETS } from "./fonts";

describe("FONT_PRESETS", () => {
  it("contains at least one font preset", () => {
    expect(FONT_PRESETS.length).toBeGreaterThan(0);
  });

  it("each preset has required fields", () => {
    for (const preset of FONT_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.family).toBeTruthy();
      expect(preset.weights.length).toBeGreaterThan(0);
      expect(preset.googleFontsUrl).toContain("fonts.googleapis.com");
    }
  });

  it("has unique IDs", () => {
    const ids = FONT_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes montserrat as default font", () => {
    expect(FONT_PRESETS.find((p) => p.id === "montserrat")).toBeDefined();
  });
});
