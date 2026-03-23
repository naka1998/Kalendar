// === Basic Settings ===
export type Orientation = "portrait" | "landscape";
export type WeekStart = "sunday" | "monday";
export type WeekdayFormat = "ja" | "en-short" | "en-full";
export type MonthLabelFormat = "yyyy.mm" | "month-yyyy" | "ja";
export type HolidayMarkStyle = "dot" | "circle" | "underline" | "color-only";
export type ImagePosition = "top" | "bottom" | "left" | "right";
export type PageLayout = "1-month" | "2-month";
export type DownloadMode = "pdf" | "single-html" | "zip";
export type FontWeight = 300 | 400 | 600;
export type ContentAlign = "start" | "center" | "end";

// === Calendar Style ===
export interface CalendarStyle {
  monthFontSize: number;
  dayFontSize: number;
  weekdayFontSize: number;
  cellPadding: number;
  headerGap: number;
  contentAlign: ContentAlign;
  pageMarginTop: number;
}

// === Color Theme ===
export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    text: string;
    sunday: string;
    saturday: string;
    holidayMark: string;
    headerRule: string;
    gridRule: string;
    weekdayHeader: string;
    monthLabel: string;
  };
}

// === Font ===
export interface FontPreset {
  id: string;
  name: string;
  family: string;
  weights: FontWeight[];
  googleFontsUrl: string;
}

// === Image ===
export interface MonthImage {
  id: string;
  monthKey: string;
  fileName: string;
  base64: string;
  mimeType: string;
}

// === Holiday ===
export interface ManualHoliday {
  date: string;
  name: string;
}

// === Grid ===
export interface DayCell {
  date: string | null;
  dayOfMonth: number | null;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  isSunday: boolean;
  isSaturday: boolean;
}

// === Persisted Settings (shared base for export/storage) ===
export interface PersistedCalendarSettings {
  startMonth: string;
  endMonth: string;
  orientation: Orientation;
  weekStart: WeekStart;
  weekdayFormat: WeekdayFormat;
  monthLabelFormat: MonthLabelFormat;
  pageLayout: PageLayout;
  holidayMarkStyle: HolidayMarkStyle;
  themeId: string;
  fontId: string;
  fontWeight: FontWeight;
  imagePercent: number;
  imagePosition: ImagePosition;
  manualHolidays: ManualHoliday[];
  removedHolidays: string[];
  monthThemeOverrides: Record<string, string>;
}

// === HTML Generator ===
export interface HtmlGeneratorInput {
  pages: PageData[];
  orientation: Orientation;
  fontFamily: string;
  fontWeight: FontWeight;
  googleFontsUrl: string;
  calendarStyle?: Partial<Pick<CalendarStyle, "contentAlign" | "pageMarginTop">>;
}

export interface PageData {
  monthLabel: string;
  grid: DayCell[][];
  weekdayHeaders: string[];
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  imageBase64: string | null;
  imagePercent: number;
  imagePosition: ImagePosition;
}

// === Zustand Store ===
export interface CalendarState {
  startMonth: string;
  endMonth: string;
  orientation: Orientation;
  weekStart: WeekStart;
  weekdayFormat: WeekdayFormat;
  monthLabelFormat: MonthLabelFormat;
  pageLayout: PageLayout;

  apiHolidays: Record<string, string>;
  holidaysFetched: boolean;
  holidaysFetchError: string | null;
  manualHolidays: ManualHoliday[];
  removedHolidays: string[];
  holidayMarkStyle: HolidayMarkStyle;

  themeId: string;
  fontId: string;
  fontWeight: FontWeight;

  useImages: boolean;
  images: Record<string, MonthImage>;
  imagePercent: number;
  imagePosition: ImagePosition;

  monthThemeOverrides: Record<string, string>;
  calendarStyle: CalendarStyle;

  // Actions (sync only)
  setStartMonth: (month: string) => void;
  setEndMonth: (month: string) => void;
  setOrientation: (o: Orientation) => void;
  setWeekStart: (ws: WeekStart) => void;
  setWeekdayFormat: (wf: WeekdayFormat) => void;
  setMonthLabelFormat: (mlf: MonthLabelFormat) => void;
  setPageLayout: (pl: PageLayout) => void;
  setHolidayMarkStyle: (style: HolidayMarkStyle) => void;
  setThemeId: (id: string) => void;
  setFontId: (id: string) => void;
  setFontWeight: (w: FontWeight) => void;
  setImagePercent: (percent: number) => void;
  setImagePosition: (pos: ImagePosition) => void;
  setUseImages: (use: boolean) => void;
  setCalendarStyle: (style: Partial<CalendarStyle>) => void;

  setApiHolidays: (holidays: Record<string, string>) => void;
  setHolidaysFetched: (fetched: boolean) => void;
  setHolidayFetchError: (error: string | null) => void;
  addManualHoliday: (date: string, name: string) => void;
  removeManualHoliday: (date: string) => void;
  removeApiHoliday: (date: string) => void;
  restoreApiHoliday: (date: string) => void;

  setImage: (monthKey: string, image: MonthImage) => void;
  removeImage: (monthKey: string) => void;
  swapImages: (fromMonth: string, toMonth: string) => void;

  setMonthTheme: (monthKey: string, themeId: string) => void;
  clearMonthTheme: (monthKey: string) => void;
}
