import type { CalendarStyle, ContentAlign } from "@/stores/types";
import { DEFAULT_CALENDAR_STYLE } from "./constants";

const PORTRAIT_PAGE = { orientation: "portrait", imagePosition: "top" } as const;

export const CALENDAR_LAYOUTS = [
  {
    id: "standard",
    label: "標準",
    page: PORTRAIT_PAGE,
    fontId: "montserrat",
    monthLabelFormat: "yyyy.mm",
  },
  {
    id: "writing",
    label: "書き込み用",
    page: PORTRAIT_PAGE,
    fontId: "noto-sans-jp",
    monthLabelFormat: "ja",
  },
  {
    id: "centered",
    label: "クラシカル",
    page: PORTRAIT_PAGE,
    fontId: "shippori-mincho",
    monthLabelFormat: "month-yyyy",
  },
  {
    id: "right-aligned",
    label: "モダン",
    appearance: { themeId: "monochrome", holidayMarkStyle: "underline" },
    page: PORTRAIT_PAGE,
    fontId: "inter",
    monthLabelFormat: "yyyy.mm",
  },
  {
    id: "stacked",
    label: "実用的な左揃え",
    appearance: { weekdayFormat: "ja" },
    page: PORTRAIT_PAGE,
    fontId: "noto-sans-jp",
    monthLabelFormat: "ja",
  },
  {
    id: "split",
    label: "スマート",
    appearance: { themeId: "dark" },
    page: PORTRAIT_PAGE,
    fontId: "ibm-plex-sans",
    monthLabelFormat: "yyyy.mm",
  },
  {
    id: "side-title",
    label: "左サイド見出し",
    page: PORTRAIT_PAGE,
    fontId: "zen-maru-gothic",
    monthLabelFormat: "ja",
  },
  {
    id: "cards",
    label: "日付カード",
    page: PORTRAIT_PAGE,
    fontId: "m-plus-rounded-1c",
    monthLabelFormat: "ja",
  },
  {
    id: "date-list",
    label: "縦リスト",
    page: { orientation: "landscape", imagePosition: "left" },
    fontId: "noto-sans-jp",
    monthLabelFormat: "ja",
  },
] as const;

export type CalendarLayout = (typeof CALENDAR_LAYOUTS)[number]["id"];

export type SavedCalendarLayout = CalendarLayout | "full-grid" | "unruled" | "week-bands";

export function resolveCalendarLayout(layout: SavedCalendarLayout | undefined): CalendarLayout {
  return CALENDAR_LAYOUTS.find(({ id }) => id === layout)?.id ?? "standard";
}

export function getDayRules(
  style?: Pick<CalendarStyle, "layoutPreset" | "dayRuleH" | "dayRuleV" | "dayFrame">,
) {
  const layout = style?.layoutPreset;
  return {
    dayFrame: style?.dayFrame ?? layout === "writing",
    dayRuleH: style?.dayRuleH ?? (layout !== "unruled" && layout !== "right-aligned"),
    dayRuleV:
      style?.dayRuleV ?? (layout === "full-grid" || layout === "writing" || layout === "cards"),
  };
}

export const TITLE_POSITIONS = [
  { value: "left", label: "左" },
  { value: "center", label: "中央" },
  { value: "right", label: "右" },
  { value: "side", label: "左側に縦書き" },
] as const;
export const TITLE_ORDERS = [
  { value: "together", label: "ひと続き" },
  { value: "stacked", label: "年を上、月を下" },
  { value: "split", label: "月を左、年を右" },
] as const;
export const TITLE_RULES = [
  { value: "full", label: "全幅" },
  { value: "short", label: "短い線" },
  { value: "none", label: "なし" },
] as const;
export type TitlePosition = (typeof TITLE_POSITIONS)[number]["value"];
export type TitleOrder = (typeof TITLE_ORDERS)[number]["value"];
export type TitleRule = (typeof TITLE_RULES)[number]["value"];

export function getTitleSettings(
  style?: Pick<
    CalendarStyle,
    "layoutPreset" | "titlePosition" | "titleOrder" | "titleRule" | "weekdayAlign"
  >,
) {
  const layout = resolveCalendarLayout(style?.layoutPreset);
  const defaultPosition =
    layout === "centered" || layout === "cards" || layout === "writing"
      ? "center"
      : layout === "right-aligned"
        ? "right"
        : layout === "side-title"
          ? "side"
          : "left";
  const defaultOrder =
    layout === "stacked"
      ? "stacked"
      : layout === "split" || layout === "date-list"
        ? "split"
        : "together";
  const defaultRule =
    layout === "centered"
      ? "short"
      : layout === "right-aligned" || layout === "side-title" || layout === "writing"
        ? "none"
        : "full";
  return {
    titlePosition:
      TITLE_POSITIONS.find(({ value }) => value === style?.titlePosition)?.value ?? defaultPosition,
    titleOrder:
      TITLE_ORDERS.find(({ value }) => value === style?.titleOrder)?.value ?? defaultOrder,
    titleRule: TITLE_RULES.find(({ value }) => value === style?.titleRule)?.value ?? defaultRule,
    weekdayAlign:
      resolveDayAlignment(style?.weekdayAlign) ??
      (layout === "stacked" ? "start" : layout === "right-aligned" ? "end" : "center"),
  };
}

export function getCalendarTitle(order: TitleOrder, label: string) {
  if (order === "together") return { main: label };

  // Keep the selected language and month notation when separating the year.
  const japanese = label.match(/^(\d{4}年)(.+)$/);
  if (japanese) return { main: japanese[2], year: japanese[1] };
  const numeric = label.match(/^(\d{4})\.(\d{2})$/);
  if (numeric) return { main: numeric[2], year: numeric[1] };
  const english = label.match(/^(.+) (\d{4})$/);
  if (english) return { main: english[1], year: english[2] };
  return { main: label };
}

const LAYOUT_FONT_SIZES: Partial<
  Record<
    CalendarLayout,
    Partial<Pick<CalendarStyle, "monthFontSize" | "dayFontSize" | "weekdayFontSize">>
  >
> = {
  centered: { monthFontSize: 54, dayFontSize: 16 },
  stacked: { weekdayFontSize: 14, dayFontSize: 16 },
  "side-title": { monthFontSize: 36 },
  cards: { monthFontSize: 54, dayFontSize: 18, weekdayFontSize: 13 },
  "date-list": { monthFontSize: 40, dayFontSize: 13 },
};

export function getPresetStyle(layoutPreset: CalendarLayout) {
  return {
    layoutPreset,
    ...getTitleSettings({ layoutPreset }),
    ...getDayRules({ layoutPreset }),
    dayAlignH: undefined,
    dayAlignV: undefined,
    monthFontSize: DEFAULT_CALENDAR_STYLE.monthFontSize,
    dayFontSize: DEFAULT_CALENDAR_STYLE.dayFontSize,
    weekdayFontSize: DEFAULT_CALENDAR_STYLE.weekdayFontSize,
    cellPadding: DEFAULT_CALENDAR_STYLE.cellPadding,
    headerGap: DEFAULT_CALENDAR_STYLE.headerGap,
    gridWidth: DEFAULT_CALENDAR_STYLE.gridWidth,
    ...LAYOUT_FONT_SIZES[layoutPreset],
  };
}

export function isPresetAdjusted(style: CalendarStyle): boolean {
  const preset = getPresetStyle(resolveCalendarLayout(style.layoutPreset));
  const current = {
    ...style,
    layoutPreset: preset.layoutPreset,
    ...getTitleSettings(style),
    ...getDayRules(style),
  };
  return (Object.keys(preset) as (keyof typeof preset)[]).some(
    (key) => preset[key] !== current[key],
  );
}

export function resolveDayAlignment(value: ContentAlign | undefined): ContentAlign | undefined {
  if (value === "start" || value === "center" || value === "end") return value;
}

export function getDayCellPadding(padding: number, vertical?: ContentAlign): string {
  if (vertical === "start") return `0 0 ${padding * 2}px`;
  if (vertical === "end") return `${padding * 2}px 0 0`;
  return `${padding}px 0`;
}
