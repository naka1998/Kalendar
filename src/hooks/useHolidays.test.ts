import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHolidays } from "./useHolidays";
import { useCalendarStore } from "@/stores/calendarStore";
import { DEFAULTS, DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

function resetStore() {
  useCalendarStore.setState({
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
    manualHolidays: [],
    removedHolidays: [],
    holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,
    themeId: DEFAULTS.THEME_ID,
    fontId: DEFAULTS.FONT_ID,
    fontWeight: DEFAULTS.FONT_WEIGHT,
    useImages: true,
    images: {},
    imagePercent: DEFAULTS.IMAGE_PERCENT,
    imagePosition: DEFAULTS.IMAGE_POSITION,
    monthThemeOverrides: {},
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
  });
}

describe("useHolidays", () => {
  beforeEach(() => {
    resetStore();
  });

  it("fetches holidays and updates store on mount", async () => {
    const mockHolidays = { "2026-01-01": "元日" };
    const service = {
      fetchHolidays: vi.fn().mockResolvedValue(mockHolidays),
    };

    renderHook(() => useHolidays(service));

    await waitFor(() => {
      expect(useCalendarStore.getState().apiHolidays).toEqual(mockHolidays);
    });
    expect(service.fetchHolidays).toHaveBeenCalledOnce();
  });

  it("sets error on fetch failure", async () => {
    const service = {
      fetchHolidays: vi.fn().mockRejectedValue(new Error("Network error")),
    };

    renderHook(() => useHolidays(service));

    await waitFor(() => {
      expect(useCalendarStore.getState().holidaysFetchError).toBe("Network error");
    });
  });

  it("skips fetch when holidays are already fetched", () => {
    useCalendarStore.setState({ holidaysFetched: true });

    const service = {
      fetchHolidays: vi.fn().mockResolvedValue({}),
    };

    renderHook(() => useHolidays(service));

    expect(service.fetchHolidays).not.toHaveBeenCalled();
  });
});
