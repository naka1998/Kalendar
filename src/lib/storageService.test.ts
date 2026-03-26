import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveToStorage,
  loadFromStorage,
  clearStorage,
  hasSavedData,
  getSavedTimestamp,
} from "./storageService";
import { STORAGE_KEYS } from "./constants";
import type { CalendarState } from "@/stores/types";

function createMockState(overrides: Partial<CalendarState> = {}): CalendarState {
  return {
    startMonth: "2026-04",
    endMonth: "2027-03",
    orientation: "portrait",
    weekStart: "sunday",
    weekdayFormat: "en-short",
    monthLabelFormat: "yyyy.mm",
    pageLayout: "1-month",
    apiHolidays: { "2026-01-01": "元日" },
    holidaysFetched: true,
    holidaysFetchError: null,
    manualHolidays: [{ date: "2026-06-01", name: "記念日" }],
    removedHolidays: ["2026-01-01"],
    holidayMarkStyle: "dot",
    themeId: "classic",
    fontId: "montserrat",
    fontWeight: 400,
    useImages: true,
    images: {
      "2026-04": {
        id: "img-1",
        monthKey: "2026-04",
        fileName: "april.jpg",
        base64: "data:image/jpeg;base64,AAAA",
        mimeType: "image/jpeg",
      },
    },
    imagePercent: 50,
    imagePosition: "top",
    imageCropSettings: {},
    monthThemeOverrides: { "2026-04": "ocean" },
    calendarStyle: {
      monthFontSize: 48,
      dayFontSize: 14,
      weekdayFontSize: 12,
      cellPadding: 8,
      headerGap: 8,
      contentAlign: "center",
      imageAlign: "center",
      pageMarginTop: 0,
    },
    lastAutoSavedAt: null,
    saveError: null,
    showSafeMargin: false,
    previewZoom: "standard",
    // Actions (stubs)
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
    setImagePercent: () => {},
    setImagePosition: () => {},
    setUseImages: () => {},
    setCalendarStyle: () => {},
    setShowSafeMargin: () => {},
    setPreviewZoom: () => {},
    setApiHolidays: () => {},
    setHolidaysFetched: () => {},
    setHolidayFetchError: () => {},
    addManualHoliday: () => {},
    removeManualHoliday: () => {},
    removeApiHoliday: () => {},
    restoreApiHoliday: () => {},
    setImage: () => {},
    removeImage: () => {},
    swapImages: () => {},
    setImageCropSettings: () => {},
    removeImageCropSettings: () => {},
    updateImageAspectRatio: () => {},
    setMonthTheme: () => {},
    clearMonthTheme: () => {},
    resetCalendar: () => {},
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("saveToStorage", () => {
  it("saves state to localStorage", () => {
    const state = createMockState();
    const result = saveToStorage(state);

    expect(result.success).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).not.toBeNull();
  });

  it("handles QuotaExceededError gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });

    const state = createMockState();
    const result = saveToStorage(state);

    expect(result.success).toBe(false);
    expect(result.error).toContain("保存容量");

    vi.restoreAllMocks();
  });
});

describe("loadFromStorage", () => {
  it("returns null when no data saved", () => {
    expect(loadFromStorage()).toBeNull();
  });

  it("returns saved state after saveToStorage", () => {
    const state = createMockState();
    saveToStorage(state);

    const loaded = loadFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded!.startMonth).toBe("2026-04");
    expect(loaded!.themeId).toBe("classic");
    expect(loaded!.images["2026-04"].fileName).toBe("april.jpg");
    expect(loaded!.manualHolidays).toEqual([{ date: "2026-06-01", name: "記念日" }]);
  });

  it("excludes apiHolidays and fetch state from saved data", () => {
    const state = createMockState();
    saveToStorage(state);

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)!);
    expect(raw.state.apiHolidays).toBeUndefined();
    expect(raw.state.holidaysFetched).toBeUndefined();
    expect(raw.state.holidaysFetchError).toBeUndefined();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, "not json");
    expect(loadFromStorage()).toBeNull();
  });

  it("returns null for unsupported version", () => {
    localStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify({ version: 99, savedAt: "", state: {} }),
    );
    expect(loadFromStorage()).toBeNull();
  });
});

describe("clearStorage", () => {
  it("removes saved data", () => {
    saveToStorage(createMockState());
    expect(hasSavedData()).toBe(true);

    clearStorage();
    expect(hasSavedData()).toBe(false);
    expect(loadFromStorage()).toBeNull();
  });
});

describe("hasSavedData", () => {
  it("returns false when no data", () => {
    expect(hasSavedData()).toBe(false);
  });

  it("returns true after save", () => {
    saveToStorage(createMockState());
    expect(hasSavedData()).toBe(true);
  });

  it("returns false for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, "not json");
    expect(hasSavedData()).toBe(false);
  });

  it("returns false for unsupported version", () => {
    localStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify({ version: 99, savedAt: "", state: {} }),
    );
    expect(hasSavedData()).toBe(false);
  });
});

describe("getSavedTimestamp", () => {
  it("returns null when no data", () => {
    expect(getSavedTimestamp()).toBeNull();
  });

  it("returns ISO timestamp after save", () => {
    saveToStorage(createMockState());
    const ts = getSavedTimestamp();
    expect(ts).not.toBeNull();
    expect(new Date(ts!).getTime()).not.toBeNaN();
  });
});

describe("round-trip", () => {
  it("preserves all user-editable fields", () => {
    const state = createMockState({
      orientation: "landscape",
      weekStart: "monday",
      fontWeight: 600,
      imagePosition: "left",
      calendarStyle: {
        monthFontSize: 36,
        dayFontSize: 16,
        weekdayFontSize: 10,
        cellPadding: 4,
        headerGap: 12,
        contentAlign: "start",
        imageAlign: "center",
        pageMarginTop: 20,
      },
    });
    saveToStorage(state);

    const loaded = loadFromStorage()!;
    expect(loaded.orientation).toBe("landscape");
    expect(loaded.weekStart).toBe("monday");
    expect(loaded.fontWeight).toBe(600);
    expect(loaded.imagePosition).toBe("left");
    expect(loaded.calendarStyle.monthFontSize).toBe(36);
    expect(loaded.calendarStyle.pageMarginTop).toBe(20);
    expect(loaded.monthThemeOverrides).toEqual({ "2026-04": "ocean" });
  });
});
