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
export type PreviewZoom = "large" | "standard" | "small";
export type FitMode = "contain" | "cover" | "none" | "fit-width" | "fit-height";

// Per-month image crop settings (crop-rect model)
export interface ImageCropSettings {
  cropX: number; // 枠の左端 (画像幅に対する割合 0.0〜1.0)
  cropY: number; // 枠の上端 (画像高さに対する割合 0.0〜1.0)
  cropW: number; // 枠の幅 (画像幅に対する割合 0.0〜1.0)
  cropH: number; // 枠の高さ (画像高さに対する割合 0.0〜1.0)
}

// === Calendar Style ===
export interface CalendarStyle {
  monthFontSize: number;
  dayFontSize: number;
  weekdayFontSize: number;
  cellPadding: number;
  headerGap: number;
  contentAlignV: ContentAlign;
  contentAlignH: ContentAlign;
  imageAlignV: ContentAlign;
  imageAlignH: ContentAlign;
  pageMarginTop: number;
  gridWidth: number;
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
  aspectRatio?: number; // naturalWidth / naturalHeight
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
  imageFitMode: FitMode;
  manualHolidays: ManualHoliday[];
  removedHolidays: string[];
  monthThemeOverrides: Record<string, string>;
  imageCropSettings?: Record<string, ImageCropSettings>;
}

// === HTML Generator ===
export interface HtmlGeneratorInput {
  pages: PageData[];
  orientation: Orientation;
  fontFamily: string;
  fontWeight: FontWeight;
  googleFontsUrl: string;
  calendarStyle?: Partial<
    Pick<
      CalendarStyle,
      | "contentAlignV"
      | "contentAlignH"
      | "imageAlignV"
      | "imageAlignH"
      | "pageMarginTop"
      | "monthFontSize"
      | "dayFontSize"
      | "weekdayFontSize"
      | "cellPadding"
      | "headerGap"
    >
  >;
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
  imageCropSettings?: ImageCropSettings;
  imageFitMode?: FitMode;
  imageAspectRatio?: number;
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
  imageFitMode: FitMode;
  imageCropSettings: Record<string, ImageCropSettings>;

  monthThemeOverrides: Record<string, string>;
  calendarStyle: CalendarStyle;

  // Transient (not persisted)
  lastAutoSavedAt: string | null;
  saveError: string | null;
  showSafeMargin: boolean;
  previewZoom: PreviewZoom;

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
  setImageFitMode: (mode: FitMode) => void;
  setUseImages: (use: boolean) => void;
  setCalendarStyle: (style: Partial<CalendarStyle>) => void;
  setShowSafeMargin: (show: boolean) => void;
  setPreviewZoom: (zoom: PreviewZoom) => void;

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
  setImageCropSettings: (monthKey: string, settings: ImageCropSettings) => void;
  removeImageCropSettings: (monthKey: string) => void;
  updateImageAspectRatio: (monthKey: string, aspectRatio: number) => void;

  setMonthTheme: (monthKey: string, themeId: string) => void;
  clearMonthTheme: (monthKey: string) => void;
  resetCalendar: () => void;
}
