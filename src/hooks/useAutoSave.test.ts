import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSave, suppressNextAutoSave } from "./useAutoSave";
import * as storageService from "@/lib/storageService";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS } from "@/lib/constants";

vi.mock("@/lib/storageService", () => ({
  saveToStorage: vi.fn(() => ({ success: true })),
  loadFromStorage: vi.fn(() => null),
  hasSavedData: vi.fn(() => false),
  clearStorage: vi.fn(),
  getSavedTimestamp: vi.fn(() => null),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.mocked(storageService.saveToStorage).mockReturnValue({ success: true });
  // Reset store to defaults to ensure clean state between tests
  useCalendarStore.setState({
    themeId: DEFAULTS.THEME_ID,
    lastAutoSavedAt: null,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutoSave", () => {
  it("does not save on initial mount", async () => {
    renderHook(() => useAutoSave(true));
    await act(async () => vi.advanceTimersByTime(3000));
    expect(storageService.saveToStorage).not.toHaveBeenCalled();
  });

  it("does not subscribe when disabled", async () => {
    renderHook(() => useAutoSave(false));
    await act(async () => useCalendarStore.setState({ themeId: "ocean" }));
    await act(async () => vi.advanceTimersByTime(3000));
    expect(storageService.saveToStorage).not.toHaveBeenCalled();
  });

  it("saves after debounce when a persisted field changes", async () => {
    renderHook(() => useAutoSave(true));

    // Trigger a user edit
    await act(async () => {
      useCalendarStore.setState({ themeId: "ocean" });
    });
    expect(storageService.saveToStorage).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(storageService.saveToStorage).toHaveBeenCalledTimes(1);
  });

  it("updates lastAutoSavedAt on successful save", async () => {
    renderHook(() => useAutoSave(true));
    await act(async () => {
      useCalendarStore.setState({ themeId: "ocean" });
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(useCalendarStore.getState().lastAutoSavedAt).not.toBeNull();
  });

  it("does not save when suppressNextAutoSave was called", async () => {
    renderHook(() => useAutoSave(true));
    suppressNextAutoSave();
    await act(async () => {
      useCalendarStore.setState({ themeId: "ocean" });
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(storageService.saveToStorage).not.toHaveBeenCalled();
  });

  it("does not save when only non-persisted fields change", async () => {
    renderHook(() => useAutoSave(true));
    await act(async () => {
      useCalendarStore.setState({ holidaysFetched: true });
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(storageService.saveToStorage).not.toHaveBeenCalled();
  });

  it("debounces rapid changes into a single save", async () => {
    renderHook(() => useAutoSave(true));
    await act(async () => {
      useCalendarStore.setState({ themeId: "ocean" });
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    await act(async () => {
      useCalendarStore.setState({ themeId: "dark" });
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(storageService.saveToStorage).toHaveBeenCalledTimes(1);
  });
});
