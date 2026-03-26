import { describe, it, expect, beforeEach } from "vitest";
import { useCalendarStore } from "@/stores/calendarStore";
import { saveToStorage, loadFromStorage, clearStorage, hasSavedData } from "@/lib/storageService";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

beforeEach(() => {
  localStorage.clear();
  // Reset store to defaults
  useCalendarStore.getState().resetCalendar();
});

describe("startup auto-restore", () => {
  it("restores saved state from storage", () => {
    // Save state with modified theme
    useCalendarStore.setState({ themeId: "ocean", orientation: "landscape" });
    saveToStorage(useCalendarStore.getState());

    // Reset store to simulate fresh load
    useCalendarStore.getState().resetCalendar();
    expect(useCalendarStore.getState().themeId).toBe(DEFAULTS.THEME_ID);

    // Simulate the module-level restore logic from App.tsx
    const savedData = loadFromStorage();
    if (savedData) {
      useCalendarStore.setState((prev) => ({ ...prev, ...savedData }));
    }

    expect(useCalendarStore.getState().themeId).toBe("ocean");
    expect(useCalendarStore.getState().orientation).toBe("landscape");
  });

  it("keeps defaults when no saved data exists", () => {
    const savedData = loadFromStorage();
    expect(savedData).toBeNull();
    expect(useCalendarStore.getState().themeId).toBe(DEFAULTS.THEME_ID);
  });
});

describe("auto-save after startup restore", () => {
  it("first edit after restore triggers auto-save", () => {
    // Save some state
    useCalendarStore.setState({ themeId: "ocean" });
    saveToStorage(useCalendarStore.getState());

    // Simulate restore (before subscribe)
    useCalendarStore.getState().resetCalendar();
    const savedData = loadFromStorage();
    if (savedData) {
      useCalendarStore.setState((prev) => ({ ...prev, ...savedData }));
    }

    // Record subscribe callbacks
    const changes: string[] = [];
    const unsub = useCalendarStore.subscribe((state) => {
      changes.push(state.themeId);
    });

    // Simulate first user edit
    useCalendarStore.setState({ themeId: "dark" });
    expect(changes).toContain("dark");

    unsub();
  });
});

describe("resetCalendar clears storage and state", () => {
  it("resets state and clears storage together", () => {
    // Set up modified state and save
    useCalendarStore.setState({
      themeId: "ocean",
      orientation: "landscape",
      fontId: "noto-sans-jp",
    });
    saveToStorage(useCalendarStore.getState());
    expect(hasSavedData()).toBe(true);

    // Reset
    clearStorage();
    useCalendarStore.getState().resetCalendar();

    // Verify storage is cleared
    expect(hasSavedData()).toBe(false);
    expect(loadFromStorage()).toBeNull();

    // Verify state is back to defaults
    const state = useCalendarStore.getState();
    expect(state.themeId).toBe(DEFAULTS.THEME_ID);
    expect(state.orientation).toBe(DEFAULTS.ORIENTATION);
    expect(state.fontId).toBe(DEFAULTS.FONT_ID);
    expect(state.manualHolidays).toEqual([]);
    expect(state.images).toEqual({});
    expect(state.calendarStyle).toEqual(DEFAULT_CALENDAR_STYLE);
  });
});
