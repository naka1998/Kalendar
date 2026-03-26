import { getMonthGrid, getWeekdayHeaders, formatMonthLabel, enrichDayCells } from "./dateUtils";
import { mergeHolidays } from "./holidayUtils";
import { resolveTheme } from "./themeUtils";
import { THEMES } from "./themes";
import type { CalendarState, PageData } from "@/stores/types";

type PageDataDeps = Pick<
  CalendarState,
  | "weekStart"
  | "weekdayFormat"
  | "monthLabelFormat"
  | "themeId"
  | "monthThemeOverrides"
  | "holidayMarkStyle"
  | "apiHolidays"
  | "manualHolidays"
  | "removedHolidays"
  | "useImages"
  | "images"
  | "imagePercent"
  | "imagePosition"
  | "imageCropSettings"
>;

export function buildPageData(monthKey: string, state: PageDataDeps): PageData {
  const holidays = mergeHolidays(state.apiHolidays, state.manualHolidays, state.removedHolidays);
  const rawGrid = getMonthGrid(monthKey, state.weekStart);
  const grid = enrichDayCells(rawGrid, holidays);
  const theme = resolveTheme(state.themeId, monthKey, state.monthThemeOverrides, THEMES);

  return {
    monthLabel: formatMonthLabel(monthKey, state.monthLabelFormat),
    grid,
    weekdayHeaders: getWeekdayHeaders(state.weekdayFormat, state.weekStart),
    theme,
    holidayMarkStyle: state.holidayMarkStyle,
    imageBase64: state.useImages ? (state.images[monthKey]?.base64 ?? null) : null,
    imagePercent: state.imagePercent,
    imagePosition: state.imagePosition,
    imageCropSettings: state.imageCropSettings[monthKey],
    imageAspectRatio: state.images[monthKey]?.aspectRatio,
  };
}
