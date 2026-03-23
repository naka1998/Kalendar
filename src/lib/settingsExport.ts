import type { CalendarState } from "@/stores/types";

interface ExportedSettings {
  version: 1;
  startMonth: string;
  endMonth: string;
  orientation: string;
  weekStart: string;
  weekdayFormat: string;
  monthLabelFormat: string;
  pageLayout: string;
  holidayMarkStyle: string;
  themeId: string;
  fontId: string;
  fontWeight: number;
  imageRatio: string;
  manualHolidays: { date: string; name: string }[];
  removedHolidays: string[];
  monthThemeOverrides: Record<string, string>;
  imageFileNames: Record<string, string>;
}

export function exportSettings(state: CalendarState): string {
  const exported: ExportedSettings = {
    version: 1,
    startMonth: state.startMonth,
    endMonth: state.endMonth,
    orientation: state.orientation,
    weekStart: state.weekStart,
    weekdayFormat: state.weekdayFormat,
    monthLabelFormat: state.monthLabelFormat,
    pageLayout: state.pageLayout,
    holidayMarkStyle: state.holidayMarkStyle,
    themeId: state.themeId,
    fontId: state.fontId,
    fontWeight: state.fontWeight,
    imageRatio: state.imageRatio,
    manualHolidays: state.manualHolidays,
    removedHolidays: state.removedHolidays,
    monthThemeOverrides: state.monthThemeOverrides,
    imageFileNames: Object.fromEntries(
      Object.entries(state.images).map(([k, v]) => [k, v.fileName]),
    ),
  };
  return JSON.stringify(exported, null, 2);
}

export function importSettings(
  json: string,
): Partial<
  Pick<
    CalendarState,
    | "startMonth"
    | "endMonth"
    | "orientation"
    | "weekStart"
    | "weekdayFormat"
    | "monthLabelFormat"
    | "pageLayout"
    | "holidayMarkStyle"
    | "themeId"
    | "fontId"
    | "fontWeight"
    | "imageRatio"
    | "manualHolidays"
    | "removedHolidays"
    | "monthThemeOverrides"
  >
> {
  const data = JSON.parse(json) as ExportedSettings;
  if (data.version !== 1) throw new Error("Unsupported settings version");

  return {
    startMonth: data.startMonth,
    endMonth: data.endMonth,
    orientation: data.orientation as CalendarState["orientation"],
    weekStart: data.weekStart as CalendarState["weekStart"],
    weekdayFormat: data.weekdayFormat as CalendarState["weekdayFormat"],
    monthLabelFormat: data.monthLabelFormat as CalendarState["monthLabelFormat"],
    pageLayout: data.pageLayout as CalendarState["pageLayout"],
    holidayMarkStyle: data.holidayMarkStyle as CalendarState["holidayMarkStyle"],
    themeId: data.themeId,
    fontId: data.fontId,
    fontWeight: data.fontWeight as CalendarState["fontWeight"],
    imageRatio: data.imageRatio as CalendarState["imageRatio"],
    manualHolidays: data.manualHolidays,
    removedHolidays: data.removedHolidays,
    monthThemeOverrides: data.monthThemeOverrides,
  };
}
