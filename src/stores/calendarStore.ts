import { create } from "zustand";
import {
  DEFAULT_CALENDAR_STYLE,
  DEFAULTS,
  IMAGE_PERCENT_MIN,
  IMAGE_PERCENT_MAX,
} from "@/lib/constants";
import type { CalendarState } from "./types";

export const useCalendarStore = create<CalendarState>((set) => ({
  // Basic settings
  startMonth: DEFAULTS.START_MONTH,
  endMonth: DEFAULTS.END_MONTH,
  orientation: DEFAULTS.ORIENTATION,
  weekStart: DEFAULTS.WEEK_START,
  weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
  monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
  pageLayout: DEFAULTS.PAGE_LAYOUT,

  // Holidays
  apiHolidays: {},
  holidaysFetched: false,
  holidaysFetchError: null,
  manualHolidays: [],
  removedHolidays: [],
  holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,

  // Design
  themeId: DEFAULTS.THEME_ID,
  fontId: DEFAULTS.FONT_ID,
  fontWeight: DEFAULTS.FONT_WEIGHT,

  // Images
  useImages: true,
  images: {},
  imagePercent: DEFAULTS.IMAGE_PERCENT,
  imagePosition: DEFAULTS.IMAGE_POSITION,

  // Month theme overrides
  monthThemeOverrides: {},
  calendarStyle: { ...DEFAULT_CALENDAR_STYLE },

  // Transient
  lastAutoSavedAt: null,
  saveError: null,
  showSafeMargin: false,

  // Basic setting actions
  setStartMonth: (month) => set({ startMonth: month }),
  setEndMonth: (month) => set({ endMonth: month }),
  setOrientation: (o) => set({ orientation: o }),
  setWeekStart: (ws) => set({ weekStart: ws }),
  setWeekdayFormat: (wf) => set({ weekdayFormat: wf }),
  setMonthLabelFormat: (mlf) => set({ monthLabelFormat: mlf }),
  setPageLayout: (pl) => set({ pageLayout: pl }),
  setHolidayMarkStyle: (style) => set({ holidayMarkStyle: style }),
  setThemeId: (id) => set({ themeId: id }),
  setFontId: (id) => set({ fontId: id }),
  setFontWeight: (w) => set({ fontWeight: w }),
  setImagePercent: (percent) =>
    set({
      imagePercent: Math.round(Math.max(IMAGE_PERCENT_MIN, Math.min(IMAGE_PERCENT_MAX, percent))),
    }),
  setImagePosition: (pos) => set({ imagePosition: pos }),
  setUseImages: (use) => set({ useImages: use }),
  setCalendarStyle: (style) => set((s) => ({ calendarStyle: { ...s.calendarStyle, ...style } })),
  setShowSafeMargin: (show) => set({ showSafeMargin: show }),

  // Holiday actions
  setApiHolidays: (holidays) =>
    set({ apiHolidays: holidays, holidaysFetched: true, holidaysFetchError: null }),
  setHolidaysFetched: (fetched) => set({ holidaysFetched: fetched }),
  setHolidayFetchError: (error) => set({ holidaysFetchError: error }),
  addManualHoliday: (date, name) =>
    set((s) => ({ manualHolidays: [...s.manualHolidays, { date, name }] })),
  removeManualHoliday: (date) =>
    set((s) => ({ manualHolidays: s.manualHolidays.filter((h) => h.date !== date) })),
  removeApiHoliday: (date) => set((s) => ({ removedHolidays: [...s.removedHolidays, date] })),
  restoreApiHoliday: (date) =>
    set((s) => ({ removedHolidays: s.removedHolidays.filter((d) => d !== date) })),

  // Image actions
  setImage: (monthKey, image) => set((s) => ({ images: { ...s.images, [monthKey]: image } })),
  removeImage: (monthKey) =>
    set((s) => {
      const { [monthKey]: _, ...rest } = s.images;
      return { images: rest };
    }),
  swapImages: (fromMonth, toMonth) =>
    set((s) => {
      const fromImage = s.images[fromMonth];
      if (!fromImage) return s;
      const toImage = s.images[toMonth];
      const newImages = { ...s.images };
      delete newImages[fromMonth];
      newImages[toMonth] = { ...fromImage, monthKey: toMonth };
      if (toImage) {
        newImages[fromMonth] = { ...toImage, monthKey: fromMonth };
      }
      return { images: newImages };
    }),

  // Month theme actions
  setMonthTheme: (monthKey, themeId) =>
    set((s) => ({ monthThemeOverrides: { ...s.monthThemeOverrides, [monthKey]: themeId } })),
  clearMonthTheme: (monthKey) =>
    set((s) => {
      const { [monthKey]: _, ...rest } = s.monthThemeOverrides;
      return { monthThemeOverrides: rest };
    }),
}));
