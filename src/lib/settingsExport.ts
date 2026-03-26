import type { CalendarState, CalendarStyle, PersistedCalendarSettings } from "@/stores/types";

interface ExportedSettings extends PersistedCalendarSettings {
  version: 1;
  imageFileNames: Record<string, string>;
  calendarStyle?: CalendarStyle;
}

export type ImportedSettings = Partial<PersistedCalendarSettings> & {
  calendarStyle?: CalendarStyle;
};

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
    imagePercent: state.imagePercent,
    imagePosition: state.imagePosition,
    imageFitMode: state.imageFitMode,
    manualHolidays: state.manualHolidays,
    removedHolidays: state.removedHolidays,
    monthThemeOverrides: state.monthThemeOverrides,
    imageFileNames: Object.fromEntries(
      Object.entries(state.images).map(([k, v]) => [k, v.fileName]),
    ),
    calendarStyle: state.calendarStyle,
    imageCropSettings: state.imageCropSettings,
  };
  return JSON.stringify(exported, null, 2);
}

export function importSettings(json: string): ImportedSettings {
  const data = JSON.parse(json) as ExportedSettings;
  if (data.version !== 1) throw new Error("Unsupported settings version");

  return {
    startMonth: data.startMonth,
    endMonth: data.endMonth,
    orientation: data.orientation,
    weekStart: data.weekStart,
    weekdayFormat: data.weekdayFormat,
    monthLabelFormat: data.monthLabelFormat,
    pageLayout: data.pageLayout,
    holidayMarkStyle: data.holidayMarkStyle,
    themeId: data.themeId,
    fontId: data.fontId,
    fontWeight: data.fontWeight,
    imagePercent: data.imagePercent,
    imagePosition: data.imagePosition,
    imageFitMode: data.imageFitMode,
    manualHolidays: data.manualHolidays,
    removedHolidays: data.removedHolidays,
    monthThemeOverrides: data.monthThemeOverrides,
    ...(data.calendarStyle ? { calendarStyle: data.calendarStyle } : {}),
    ...(data.imageCropSettings ? { imageCropSettings: data.imageCropSettings } : {}),
  };
}
