import type { CalendarStyle, ContentAlign } from "@/stores/types";
import { DEFAULT_CALENDAR_STYLE } from "./constants";

export const CALENDAR_LAYOUTS = [
  { id: "standard", label: "標準グリッド" },
  { id: "centered", label: "中央・短い下線" },
  { id: "right-aligned", label: "右揃え・線なし" },
  { id: "stacked", label: "年月を上下に" },
  { id: "split", label: "月は左、年は右" },
  { id: "side-title", label: "左サイド見出し" },
  { id: "cards", label: "日付カード" },
  { id: "week-bands", label: "週ごとの帯" },
  { id: "date-list", label: "縦リスト" },
] as const;

export type CalendarLayout = (typeof CALENDAR_LAYOUTS)[number]["id"];

export type SavedCalendarLayout = CalendarLayout | "full-grid" | "unruled";

export function resolveCalendarLayout(layout: SavedCalendarLayout | undefined): CalendarLayout {
  return CALENDAR_LAYOUTS.find(({ id }) => id === layout)?.id ?? "standard";
}

export function getDayRules(style?: Pick<CalendarStyle, "layoutPreset" | "dayRuleH" | "dayRuleV">) {
  const layout = style?.layoutPreset;
  return {
    dayRuleH: style?.dayRuleH ?? (layout !== "unruled" && layout !== "right-aligned"),
    dayRuleV:
      style?.dayRuleV ?? (layout === "full-grid" || layout === "cards" || layout === "week-bands"),
  };
}

export function getCalendarTitle(layout: CalendarLayout, label: string) {
  if (layout !== "stacked" && layout !== "split" && layout !== "date-list") return { main: label };

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
  "side-title": { monthFontSize: 36 },
  cards: { monthFontSize: 54, dayFontSize: 18, weekdayFontSize: 13 },
  "date-list": { monthFontSize: 40, dayFontSize: 13 },
};

export function getLayoutStyleChange(
  style: CalendarStyle,
  next: CalendarLayout,
): Partial<CalendarStyle> {
  const previousSizes = LAYOUT_FONT_SIZES[resolveCalendarLayout(style.layoutPreset)];
  const nextSizes = LAYOUT_FONT_SIZES[next];
  const change: Partial<CalendarStyle> = { layoutPreset: next };
  if (style.layoutPreset === "full-grid" || style.layoutPreset === "unruled") {
    Object.assign(change, getDayRules(style));
  }
  for (const key of ["monthFontSize", "dayFontSize", "weekdayFontSize"] as const) {
    if (style[key] === (previousSizes?.[key] ?? DEFAULT_CALENDAR_STYLE[key])) {
      change[key] = nextSizes?.[key] ?? DEFAULT_CALENDAR_STYLE[key];
    }
  }
  return change;
}

export function resolveDayAlignment(value: ContentAlign | undefined): ContentAlign | undefined {
  if (value === "start" || value === "center" || value === "end") return value;
}

export function getDayCellPadding(padding: number, vertical?: ContentAlign): string {
  if (vertical === "start") return `0 0 ${padding * 2}px`;
  if (vertical === "end") return `${padding * 2}px 0 0`;
  return `${padding}px 0`;
}
