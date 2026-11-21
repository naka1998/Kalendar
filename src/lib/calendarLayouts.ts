export const CALENDAR_LAYOUTS = [
  { id: "standard", label: "標準グリッド" },
  { id: "centered", label: "中央・短い下線" },
  { id: "right-aligned", label: "右揃え・線なし" },
  { id: "stacked", label: "年月を上下に" },
  { id: "split", label: "月は左、年は右" },
  { id: "full-grid", label: "全面格子" },
  { id: "side-title", label: "左サイド見出し" },
  { id: "unruled", label: "罫線なし" },
  { id: "cards", label: "日付カード" },
  { id: "week-bands", label: "週ごとの帯" },
  { id: "date-list", label: "縦リスト" },
] as const;

export type CalendarLayout = (typeof CALENDAR_LAYOUTS)[number]["id"];

export function resolveCalendarLayout(layout: CalendarLayout | undefined): CalendarLayout {
  return CALENDAR_LAYOUTS.find(({ id }) => id === layout)?.id ?? "standard";
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
