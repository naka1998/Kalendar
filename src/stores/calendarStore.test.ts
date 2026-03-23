import { describe, it, expect, beforeEach } from "vitest";
import { useCalendarStore } from "./calendarStore";
import { DEFAULTS } from "@/lib/constants";

describe("calendarStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
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
      imageRatio: DEFAULTS.IMAGE_RATIO,
      monthThemeOverrides: {},
    });
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useCalendarStore.getState();
      expect(state.startMonth).toBe("2026-04");
      expect(state.endMonth).toBe("2027-03");
      expect(state.orientation).toBe("portrait");
      expect(state.weekStart).toBe("sunday");
      expect(state.weekdayFormat).toBe("en-short");
      expect(state.monthLabelFormat).toBe("yyyy.mm");
      expect(state.holidayMarkStyle).toBe("dot");
      expect(state.themeId).toBe("classic");
      expect(state.fontId).toBe("montserrat");
      expect(state.fontWeight).toBe(400);
      expect(state.imageRatio).toBe("50:50");
      expect(state.pageLayout).toBe("1-month");
    });
  });

  describe("basic setting setters", () => {
    it("setStartMonth updates startMonth", () => {
      useCalendarStore.getState().setStartMonth("2026-01");
      expect(useCalendarStore.getState().startMonth).toBe("2026-01");
    });

    it("setEndMonth updates endMonth", () => {
      useCalendarStore.getState().setEndMonth("2027-12");
      expect(useCalendarStore.getState().endMonth).toBe("2027-12");
    });

    it("setOrientation updates orientation", () => {
      useCalendarStore.getState().setOrientation("landscape");
      expect(useCalendarStore.getState().orientation).toBe("landscape");
    });

    it("setWeekStart updates weekStart", () => {
      useCalendarStore.getState().setWeekStart("monday");
      expect(useCalendarStore.getState().weekStart).toBe("monday");
    });

    it("setWeekdayFormat updates weekdayFormat", () => {
      useCalendarStore.getState().setWeekdayFormat("ja");
      expect(useCalendarStore.getState().weekdayFormat).toBe("ja");
    });

    it("setMonthLabelFormat updates monthLabelFormat", () => {
      useCalendarStore.getState().setMonthLabelFormat("ja");
      expect(useCalendarStore.getState().monthLabelFormat).toBe("ja");
    });

    it("setThemeId updates themeId", () => {
      useCalendarStore.getState().setThemeId("dark");
      expect(useCalendarStore.getState().themeId).toBe("dark");
    });
  });

  describe("holiday actions", () => {
    it("setApiHolidays sets holidays and marks as fetched", () => {
      const holidays = { "2026-01-01": "元日" };
      useCalendarStore.getState().setApiHolidays(holidays);
      const state = useCalendarStore.getState();
      expect(state.apiHolidays).toEqual(holidays);
      expect(state.holidaysFetched).toBe(true);
      expect(state.holidaysFetchError).toBeNull();
    });

    it("addManualHoliday appends to list", () => {
      useCalendarStore.getState().addManualHoliday("2026-12-29", "会社休日");
      useCalendarStore.getState().addManualHoliday("2026-12-30", "年末休み");
      const state = useCalendarStore.getState();
      expect(state.manualHolidays).toHaveLength(2);
      expect(state.manualHolidays[0]).toEqual({ date: "2026-12-29", name: "会社休日" });
    });

    it("removeManualHoliday removes by date", () => {
      useCalendarStore.getState().addManualHoliday("2026-12-29", "会社休日");
      useCalendarStore.getState().addManualHoliday("2026-12-30", "年末休み");
      useCalendarStore.getState().removeManualHoliday("2026-12-29");
      expect(useCalendarStore.getState().manualHolidays).toHaveLength(1);
      expect(useCalendarStore.getState().manualHolidays[0].date).toBe("2026-12-30");
    });

    it("removeApiHoliday adds to removedHolidays", () => {
      useCalendarStore.getState().removeApiHoliday("2026-01-01");
      expect(useCalendarStore.getState().removedHolidays).toContain("2026-01-01");
    });

    it("restoreApiHoliday removes from removedHolidays", () => {
      useCalendarStore.getState().removeApiHoliday("2026-01-01");
      useCalendarStore.getState().removeApiHoliday("2026-02-11");
      useCalendarStore.getState().restoreApiHoliday("2026-01-01");
      const removed = useCalendarStore.getState().removedHolidays;
      expect(removed).not.toContain("2026-01-01");
      expect(removed).toContain("2026-02-11");
    });
  });

  describe("image actions", () => {
    it("setImage adds image for month", () => {
      const image = {
        id: "img1",
        monthKey: "2026-04",
        fileName: "photo.jpg",
        base64: "data:image/jpeg;base64,abc",
        mimeType: "image/jpeg",
      };
      useCalendarStore.getState().setImage("2026-04", image);
      expect(useCalendarStore.getState().images["2026-04"]).toEqual(image);
    });

    it("removeImage removes image for month", () => {
      const image = {
        id: "img1",
        monthKey: "2026-04",
        fileName: "photo.jpg",
        base64: "data:image/jpeg;base64,abc",
        mimeType: "image/jpeg",
      };
      useCalendarStore.getState().setImage("2026-04", image);
      useCalendarStore.getState().removeImage("2026-04");
      expect(useCalendarStore.getState().images["2026-04"]).toBeUndefined();
    });
  });

  describe("month theme actions", () => {
    it("setMonthTheme sets override for specific month", () => {
      useCalendarStore.getState().setMonthTheme("2026-04", "dark");
      expect(useCalendarStore.getState().monthThemeOverrides["2026-04"]).toBe("dark");
    });

    it("clearMonthTheme removes override", () => {
      useCalendarStore.getState().setMonthTheme("2026-04", "dark");
      useCalendarStore.getState().clearMonthTheme("2026-04");
      expect(useCalendarStore.getState().monthThemeOverrides["2026-04"]).toBeUndefined();
    });
  });
});
