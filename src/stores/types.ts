// === Basic Settings ===
export type Orientation = "portrait" | "landscape";
export type WeekStart = "sunday" | "monday";
export type WeekdayFormat = "ja" | "en-short" | "en-full";
export type MonthLabelFormat = "yyyy.mm" | "month-yyyy" | "ja";
export type HolidayMarkStyle = "dot" | "circle" | "underline" | "color-only";
export type ImageRatio = "60:40" | "50:50" | "70:30";
export type PageLayout = "1-month" | "2-month";
export type DownloadMode = "single-html" | "zip";
export type FontWeight = 300 | 400 | 600;

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

// === HTML Generator ===
export interface HtmlGeneratorInput {
  pages: PageData[];
  orientation: Orientation;
  fontFamily: string;
  fontWeight: FontWeight;
  googleFontsUrl: string;
}

export interface PageData {
  monthLabel: string;
  grid: DayCell[][];
  weekdayHeaders: string[];
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  imageBase64: string | null;
  imageRatio: ImageRatio;
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

  images: Record<string, MonthImage>;
  imageRatio: ImageRatio;

  monthThemeOverrides: Record<string, string>;

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
  setImageRatio: (ratio: ImageRatio) => void;

  setApiHolidays: (holidays: Record<string, string>) => void;
  setHolidaysFetched: (fetched: boolean) => void;
  setHolidayFetchError: (error: string | null) => void;
  addManualHoliday: (date: string, name: string) => void;
  removeManualHoliday: (date: string) => void;
  removeApiHoliday: (date: string) => void;
  restoreApiHoliday: (date: string) => void;

  setImage: (monthKey: string, image: MonthImage) => void;
  removeImage: (monthKey: string) => void;

  setMonthTheme: (monthKey: string, themeId: string) => void;
  clearMonthTheme: (monthKey: string) => void;
}
