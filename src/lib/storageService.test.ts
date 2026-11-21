import "fake-indexeddb/auto";
import { IDBObjectStore } from "fake-indexeddb";
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
    imageFitMode: "cover",
    imageCropSettings: {},
    monthThemeOverrides: { "2026-04": "ocean" },
    calendarStyle: {
      monthFontSize: 48,
      dayFontSize: 14,
      weekdayFontSize: 12,
      cellPadding: 8,
      headerGap: 8,
      contentAlignV: "center",
      contentAlignH: "center",
      imageAlignV: "center",
      imageAlignH: "center",
      pageMarginTop: 0,
      gridWidth: 100,
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
    setImageFitMode: () => {},
    setMonthTheme: () => {},
    clearMonthTheme: () => {},
    resetCalendar: () => {},
    ...overrides,
  };
}

beforeEach(async () => {
  await clearStorage();
});

describe("saveToStorage", () => {
  it("saves state in IndexedDB without using localStorage", async () => {
    const state = createMockState();
    const result = await saveToStorage(state);

    expect(result.success).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).toBeNull();
    expect(await loadFromStorage()).toMatchObject({ images: state.images });
  });

  it("handles QuotaExceededError gracefully", async () => {
    const state = createMockState();
    await saveToStorage(state);
    const write = vi.spyOn(IDBObjectStore.prototype, "clear").mockImplementationOnce(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });

    const result = await saveToStorage({ ...state, themeId: "ocean" });
    write.mockRestore();

    expect(result).toEqual({ success: false, error: expect.stringContaining("保存容量") });
    expect(await loadFromStorage()).toMatchObject({ themeId: state.themeId, images: state.images });
  });

  it("keeps settings and images in sync across overlapping saves", async () => {
    const first = saveToStorage(createMockState());
    const second = saveToStorage(createMockState({ themeId: "ocean", images: {} }));

    expect(await Promise.all([first, second])).toEqual([{ success: true }, { success: true }]);
    const loaded = await loadFromStorage();
    expect(loaded?.themeId).toBe("ocean");
    expect(loaded?.images).toEqual({});
  });
});

describe("loadFromStorage", () => {
  it("returns null when no data saved", async () => {
    expect(await loadFromStorage()).toBeNull();
  });

  it("returns saved state after saveToStorage", async () => {
    const state = createMockState();
    await saveToStorage(state);

    const loaded = await loadFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded!.startMonth).toBe("2026-04");
    expect(loaded!.themeId).toBe("classic");
    expect(loaded!.images["2026-04"].fileName).toBe("april.jpg");
    expect(loaded!.manualHolidays).toEqual([{ date: "2026-06-01", name: "記念日" }]);
  });

  it("excludes apiHolidays and fetch state from saved data", async () => {
    const state = createMockState();
    await saveToStorage(state);

    const loaded = await loadFromStorage();
    expect(loaded).not.toHaveProperty("apiHolidays");
    expect(loaded).not.toHaveProperty("holidaysFetched");
    expect(loaded).not.toHaveProperty("holidaysFetchError");
  });

  it("returns null for invalid JSON", async () => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, "not json");
    expect(await loadFromStorage()).toBeNull();
  });

  it("returns null for unsupported version", async () => {
    localStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify({ version: 99, savedAt: "", state: {} }),
    );
    expect(await loadFromStorage()).toBeNull();
  });
});

describe("clearStorage", () => {
  it("removes saved data", async () => {
    await saveToStorage(createMockState());
    expect(await hasSavedData()).toBe(true);

    await clearStorage();
    expect(await hasSavedData()).toBe(false);
    expect(await loadFromStorage()).toBeNull();
  });
});

describe("hasSavedData", () => {
  it("returns false when no data", async () => {
    expect(await hasSavedData()).toBe(false);
  });

  it("returns true after save", async () => {
    await saveToStorage(createMockState());
    expect(await hasSavedData()).toBe(true);
  });

  it("returns false for invalid JSON", async () => {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, "not json");
    expect(await hasSavedData()).toBe(false);
  });

  it("returns false for unsupported version", async () => {
    localStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify({ version: 99, savedAt: "", state: {} }),
    );
    expect(await hasSavedData()).toBe(false);
  });
});

describe("getSavedTimestamp", () => {
  it("returns null when no data", async () => {
    expect(await getSavedTimestamp()).toBeNull();
  });

  it("returns ISO timestamp after save", async () => {
    await saveToStorage(createMockState());
    const ts = await getSavedTimestamp();
    expect(ts).not.toBeNull();
    expect(new Date(ts!).getTime()).not.toBeNaN();
  });
});

describe("round-trip", () => {
  it("preserves all user-editable fields", async () => {
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
        contentAlignV: "start",
        contentAlignH: "center",
        imageAlignV: "center",
        imageAlignH: "center",
        pageMarginTop: 20,
        gridWidth: 100,
      },
    });
    await saveToStorage(state);

    const loaded = (await loadFromStorage())!;
    expect(loaded.orientation).toBe("landscape");
    expect(loaded.weekStart).toBe("monday");
    expect(loaded.fontWeight).toBe(600);
    expect(loaded.imagePosition).toBe("left");
    expect(loaded.calendarStyle.monthFontSize).toBe(36);
    expect(loaded.calendarStyle.pageMarginTop).toBe(20);
    expect(loaded.monthThemeOverrides).toEqual({ "2026-04": "ocean" });
  });
});

describe("backward compatibility", () => {
  it("fills in gridWidth default when loading old data without it", async () => {
    const state = createMockState();
    await saveToStorage(state);
    const persisted = (await loadFromStorage())!;
    await clearStorage();
    const { gridWidth: _, ...legacyStyle } = state.calendarStyle;
    localStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify({ version: 1, state: { ...persisted, calendarStyle: legacyStyle } }),
    );

    const loaded = (await loadFromStorage())!;
    expect(loaded.calendarStyle.gridWidth).toBe(100);
    expect(loaded.images).toEqual(state.images);
    await saveToStorage({ ...state, ...loaded });
    expect(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)).toBeNull();
    expect(await loadFromStorage()).toEqual(loaded);
  });

  it("preserves existing gridWidth value when present", async () => {
    const state = createMockState({
      calendarStyle: {
        ...createMockState().calendarStyle,
        gridWidth: 75,
      },
    });
    await saveToStorage(state);

    const loaded = (await loadFromStorage())!;
    expect(loaded.calendarStyle.gridWidth).toBe(75);
  });
});
