export const A4 = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  PORTRAIT_RATIO: 210 / 297,
  LANDSCAPE_RATIO: 297 / 210,
  /** Fixed pixel width for A4 portrait preview (210mm at 96dpi) */
  PORTRAIT_WIDTH_PX: 794,
  /** Fixed pixel height for A4 portrait preview (297mm at 96dpi) */
  PORTRAIT_HEIGHT_PX: 1123,
  /** Fixed pixel width for A4 landscape preview (297mm at 96dpi) */
  LANDSCAPE_WIDTH_PX: 1123,
  /** Fixed pixel height for A4 landscape preview (210mm at 96dpi) */
  LANDSCAPE_HEIGHT_PX: 794,
} as const;

export const DEFAULTS = {
  START_MONTH: "2026-04",
  END_MONTH: "2027-03",
  ORIENTATION: "portrait" as const,
  WEEK_START: "sunday" as const,
  WEEKDAY_FORMAT: "en-short" as const,
  MONTH_LABEL_FORMAT: "yyyy.mm" as const,
  HOLIDAY_MARK_STYLE: "dot" as const,
  THEME_ID: "classic",
  FONT_ID: "montserrat",
  FONT_WEIGHT: 400 as const,
  IMAGE_PERCENT: 50,
  IMAGE_POSITION: "top" as const,
  IMAGE_FIT_MODE: "cover" as const,
  PAGE_LAYOUT: "1-month" as const,
} as const;

export const DEFAULT_CALENDAR_STYLE = {
  monthFontSize: 48,
  dayFontSize: 14,
  weekdayFontSize: 12,
  cellPadding: 8,
  headerGap: 8,
  contentAlignV: "center" as const,
  contentAlignH: "center" as const,
  imageAlignV: "center" as const,
  imageAlignH: "center" as const,
  pageMarginTop: 0,
  gridWidth: 100,
} as const;

/** Safe margin for print: 5mm at 96dpi ≈ 19px */
export const SAFE_MARGIN_PX = 19;

export const IMAGE_PERCENT_MIN = 20;
export const IMAGE_PERCENT_MAX = 80;

export const DEFAULT_IMAGE_CROP_SETTINGS = {
  cropX: 0,
  cropY: 0,
  cropW: 1,
  cropH: 1,
} as const;

export const CROP_MIN_SIZE = 0.1; // 最小トリミング枠サイズ (画像の10%)

export const IMAGE = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_DIMENSION: 2400,
  JPEG_QUALITY: 0.85,
  ACCEPTED_TYPES: ["image/jpeg", "image/png"],
} as const;

export const STORAGE_KEYS = {
  HOLIDAYS_DATA: "kalendar-holidays-data",
  HOLIDAYS_FETCHED_AT: "kalendar-holidays-fetched-at",
  USER_SETTINGS: "kalendar-user-settings",
} as const;

export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
