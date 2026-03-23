import { describe, it, expect } from "vitest";
import { exportSettings, importSettings } from "./settingsExport";
import { DEFAULTS } from "./constants";
import type { CalendarState } from "@/stores/types";

function createMockState(): CalendarState {
  return {
    startMonth: DEFAULTS.START_MONTH,
    endMonth: DEFAULTS.END_MONTH,
    orientation: DEFAULTS.ORIENTATION,
    weekStart: DEFAULTS.WEEK_START,
    weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
    monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
    pageLayout: DEFAULTS.PAGE_LAYOUT,
    apiHolidays: {},
    holidaysFetched: false,
    holidaysFetchError: null,
    manualHolidays: [{ date: "2026-12-29", name: "会社休日" }],
    removedHolidays: ["2026-01-01"],
    holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    images: {
      "2026-04": {
        id: "img1",
        monthKey: "2026-04",
        fileName: "photo.jpg",
        base64: "data:image/jpeg;base64,longstring",
        mimeType: "image/jpeg",
      },
    },
    imageRatio: DEFAULTS.IMAGE_RATIO,
    monthThemeOverrides: { "2026-04": "dark" },
    // Actions (not used in export)
    setStartMonth: () => {},
    setEndMonth: () => {},
    setOrientation: () => {},
    setWeekStart: () => {},
    setWeekdayFormat: () => {},
    setMonthLabelFormat: () => {},
    setPageLayout: () => {},
    setHolidayMarkStyle: () => {},
    setThemeId: () => {},
    setFontId: () => {},
    setFontWeight: () => {},
    setImageRatio: () => {},
    setApiHolidays: () => {},
    setHolidaysFetched: () => {},
    setHolidayFetchError: () => {},
    addManualHoliday: () => {},
    removeManualHoliday: () => {},
    removeApiHoliday: () => {},
    restoreApiHoliday: () => {},
    setImage: () => {},
    removeImage: () => {},
    setMonthTheme: () => {},
    clearMonthTheme: () => {},
  };
}

describe("exportSettings", () => {
  it("exports settings as JSON string", () => {
    const json = exportSettings(createMockState());
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.startMonth).toBe("2026-04");
    expect(parsed.themeId).toBe("classic");
  });

  it("excludes image base64 data", () => {
    const json = exportSettings(createMockState());
    expect(json).not.toContain("longstring");
    expect(json).not.toContain("base64");
  });

  it("includes image file names", () => {
    const json = exportSettings(createMockState());
    const parsed = JSON.parse(json);
    expect(parsed.imageFileNames["2026-04"]).toBe("photo.jpg");
  });

  it("includes manual holidays", () => {
    const json = exportSettings(createMockState());
    const parsed = JSON.parse(json);
    expect(parsed.manualHolidays).toHaveLength(1);
    expect(parsed.manualHolidays[0].name).toBe("会社休日");
  });

  it("includes removed holidays", () => {
    const json = exportSettings(createMockState());
    const parsed = JSON.parse(json);
    expect(parsed.removedHolidays).toContain("2026-01-01");
  });

  it("includes month theme overrides", () => {
    const json = exportSettings(createMockState());
    const parsed = JSON.parse(json);
    expect(parsed.monthThemeOverrides["2026-04"]).toBe("dark");
  });
});

describe("importSettings", () => {
  it("parses exported JSON and returns settings", () => {
    const json = exportSettings(createMockState());
    const imported = importSettings(json);
    expect(imported.startMonth).toBe("2026-04");
    expect(imported.themeId).toBe("classic");
    expect(imported.manualHolidays).toHaveLength(1);
  });

  it("throws on unsupported version", () => {
    const json = JSON.stringify({ version: 99 });
    expect(() => importSettings(json)).toThrow("Unsupported settings version");
  });

  it("round-trips correctly", () => {
    const original = createMockState();
    const json = exportSettings(original);
    const imported = importSettings(json);
    expect(imported.startMonth).toBe(original.startMonth);
    expect(imported.endMonth).toBe(original.endMonth);
    expect(imported.orientation).toBe(original.orientation);
    expect(imported.weekStart).toBe(original.weekStart);
    expect(imported.themeId).toBe(original.themeId);
    expect(imported.fontId).toBe(original.fontId);
    expect(imported.monthThemeOverrides).toEqual(original.monthThemeOverrides);
  });
});
