import { create } from "zustand";
import {
  DEFAULT_CALENDAR_STYLE,
  DEFAULTS,
  IMAGE_PERCENT_MIN,
  IMAGE_PERCENT_MAX,
} from "@/lib/constants";
import type { CalendarState } from "./types";

const initialState = {
  // Basic settings
  startMonth: DEFAULTS.START_MONTH,
  endMonth: DEFAULTS.END_MONTH,
  orientation: DEFAULTS.ORIENTATION,
  weekStart: DEFAULTS.WEEK_START,
  weekdayFormat: DEFAULTS.WEEKDAY_FORMAT,
  monthLabelFormat: DEFAULTS.MONTH_LABEL_FORMAT,
  pageLayout: DEFAULTS.PAGE_LAYOUT,

  // Holidays
  apiHolidays: {} as Record<string, string>,
  holidaysFetched: false,
  holidaysFetchError: null as string | null,
  manualHolidays: [] as { date: string; name: string }[],
  removedHolidays: [] as string[],
  holidayMarkStyle: DEFAULTS.HOLIDAY_MARK_STYLE,

  // Design
  themeId: DEFAULTS.THEME_ID,
  fontId: DEFAULTS.FONT_ID,
  fontWeight: DEFAULTS.FONT_WEIGHT,

  // Images
  useImages: true,
  images: {} as Record<string, CalendarState["images"][string]>,
  imagePercent: DEFAULTS.IMAGE_PERCENT,
  imagePosition: DEFAULTS.IMAGE_POSITION,
  imageFitMode: DEFAULTS.IMAGE_FIT_MODE,
  imageCropSettings: {} as Record<string, CalendarState["imageCropSettings"][string]>,

  // Month theme overrides
  monthThemeOverrides: {} as Record<string, string>,
  calendarStyle: { ...DEFAULT_CALENDAR_STYLE },

  // Transient
  lastAutoSavedAt: null as string | null,
  saveError: null as string | null,
  showSafeMargin: false,
  previewZoom: "standard" as const,
};

export const useCalendarStore = create<CalendarState>((set) => ({
  ...initialState,

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
  setImageFitMode: (mode) => set({ imageFitMode: mode }),
  setUseImages: (use) => set({ useImages: use }),
  setCalendarStyle: (style) => set((s) => ({ calendarStyle: { ...s.calendarStyle, ...style } })),
  setShowSafeMargin: (show) => set({ showSafeMargin: show }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),

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
  setImage: (monthKey, image) =>
    set((s) => {
      const { [monthKey]: _, ...restCrop } = s.imageCropSettings;
      return { images: { ...s.images, [monthKey]: image }, imageCropSettings: restCrop };
    }),
  removeImage: (monthKey) =>
    set((s) => {
      const { [monthKey]: _, ...restImages } = s.images;
      const { [monthKey]: __, ...restCrop } = s.imageCropSettings;
      return { images: restImages, imageCropSettings: restCrop };
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

      const newCrop = { ...s.imageCropSettings };
      const fromCrop = newCrop[fromMonth];
      const toCrop = newCrop[toMonth];
      delete newCrop[fromMonth];
      delete newCrop[toMonth];
      if (fromCrop) newCrop[toMonth] = fromCrop;
      if (toCrop) newCrop[fromMonth] = toCrop;

      return { images: newImages, imageCropSettings: newCrop };
    }),
  setImageCropSettings: (monthKey, settings) =>
    set((s) => ({ imageCropSettings: { ...s.imageCropSettings, [monthKey]: settings } })),
  removeImageCropSettings: (monthKey) =>
    set((s) => {
      const { [monthKey]: _, ...rest } = s.imageCropSettings;
      return { imageCropSettings: rest };
    }),
  updateImageAspectRatio: (monthKey, aspectRatio) =>
    set((s) => {
      const image = s.images[monthKey];
      if (!image) return s;
      return { images: { ...s.images, [monthKey]: { ...image, aspectRatio } } };
    }),

  // Month theme actions
  setMonthTheme: (monthKey, themeId) =>
    set((s) => ({ monthThemeOverrides: { ...s.monthThemeOverrides, [monthKey]: themeId } })),
  clearMonthTheme: (monthKey) =>
    set((s) => {
      const { [monthKey]: _, ...rest } = s.monthThemeOverrides;
      return { monthThemeOverrides: rest };
    }),

  // Reset
  resetCalendar: () => set({ ...initialState }),
}));
