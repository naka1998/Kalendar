import { describe, it, expect } from "vitest";
import { buildPageData } from "./buildPageData";

const defaultState = {
  weekStart: "sunday" as const,
  weekdayFormat: "ja" as const,
  monthLabelFormat: "yyyy.mm" as const,
  themeId: "classic",
  monthThemeOverrides: {},
  holidayMarkStyle: "dot" as const,
  apiHolidays: {},
  manualHolidays: [],
  removedHolidays: [],
  useImages: false,
  images: {},
  imagePercent: 50,
  imagePosition: "top" as const,
};

describe("buildPageData", () => {
  it("returns PageData with correct month label", () => {
    const result = buildPageData("2026-04", defaultState);
    expect(result.monthLabel).toBe("2026.04");
  });

  it("returns a 7-column grid", () => {
    const result = buildPageData("2026-04", defaultState);
    for (const row of result.grid) {
      expect(row).toHaveLength(7);
    }
  });

  it("returns weekday headers matching format", () => {
    const result = buildPageData("2026-04", defaultState);
    expect(result.weekdayHeaders).toHaveLength(7);
    // Japanese format
    expect(result.weekdayHeaders[0]).toBe("日");
  });

  it("uses theme from themeId", () => {
    const result = buildPageData("2026-04", defaultState);
    expect(result.theme.id).toBe("classic");
  });

  it("respects monthThemeOverrides", () => {
    const state = { ...defaultState, monthThemeOverrides: { "2026-04": "dark" } };
    const result = buildPageData("2026-04", state);
    expect(result.theme.id).toBe("dark");
  });

  it("returns null imageBase64 when useImages is false", () => {
    const result = buildPageData("2026-04", defaultState);
    expect(result.imageBase64).toBeNull();
  });

  it("returns imageBase64 when useImages is true and image exists", () => {
    const state = {
      ...defaultState,
      useImages: true,
      images: {
        "2026-04": {
          id: "test",
          monthKey: "2026-04",
          fileName: "test.jpg",
          base64: "data:image/jpeg;base64,abc",
          mimeType: "image/jpeg",
        },
      },
    };
    const result = buildPageData("2026-04", state);
    expect(result.imageBase64).toBe("data:image/jpeg;base64,abc");
  });

  it("marks holidays from apiHolidays", () => {
    const state = { ...defaultState, apiHolidays: { "2026-04-29": "昭和の日" } };
    const result = buildPageData("2026-04", state);
    const allCells = result.grid.flat();
    const holiday = allCells.find((c) => c.date === "2026-04-29");
    expect(holiday?.isHoliday).toBe(true);
  });
});
