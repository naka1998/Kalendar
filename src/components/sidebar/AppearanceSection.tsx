import {
  CALENDAR_LAYOUTS,
  getLayoutStyleChange,
  getDayRules,
  resolveCalendarLayout,
} from "@/lib/calendarLayouts";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { ThemeGrid } from "./ThemeGrid";
import { FontSelector } from "./FontSelector";
import { SliderField, getFontWarningLevel } from "./SliderField";

const DAY_ALIGNMENT_OPTIONS = [undefined, "start", "center", "end"] as const;
const DAY_ALIGNMENT_FIELDS = [
  { field: "dayAlignH", label: "日付の左右揃え", choices: ["自動", "左", "中央", "右"] },
  { field: "dayAlignV", label: "日付の上下揃え", choices: ["自動", "上", "中央", "下"] },
] as const;

export function AppearanceSection() {
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

  const dayRules = getDayRules(calendarStyle);

  return (
    <div className="space-y-4">
      <section aria-label="レイアウト" className="space-y-1.5">
        <h3 className="text-xs font-bold tracking-[0.2em] text-on-surface-variant">レイアウト</h3>
        <div className="grid grid-cols-2 gap-2">
          {CALENDAR_LAYOUTS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={resolveCalendarLayout(calendarStyle.layoutPreset) === id}
              onClick={() => setCalendarStyle(getLayoutStyleChange(calendarStyle, id))}
              className="rounded-lg border border-transparent bg-surface-container-high px-2 py-2 text-xs hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-surface"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <section aria-label="日付欄の罫線" className="space-y-1.5">
        <h3 className="text-xs font-bold text-on-surface-variant">日付欄の罫線</h3>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { field: "dayRuleV", label: "縦罫線" },
              { field: "dayRuleH", label: "横罫線" },
            ] as const
          ).map(({ field, label }) => (
            <button
              key={field}
              type="button"
              aria-label={label}
              aria-pressed={dayRules[field]}
              onClick={() => setCalendarStyle({ [field]: !dayRules[field] })}
              className="rounded-lg border border-transparent bg-surface-container-high px-2 py-2 text-xs hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-surface"
            >
              {label} {dayRules[field] ? "あり" : "なし"}
            </button>
          ))}
        </div>
      </section>
      {DAY_ALIGNMENT_FIELDS.map(({ field, label, choices }) => (
        <section key={field} aria-label={label} className="space-y-1.5">
          <h3 className="text-xs font-bold text-on-surface-variant">{label}</h3>
          <div className="grid grid-cols-4 rounded-lg bg-surface-container-high p-1">
            {DAY_ALIGNMENT_OPTIONS.map((alignment, index) => (
              <button
                key={choices[index]}
                type="button"
                aria-pressed={calendarStyle[field] === alignment}
                onClick={() => setCalendarStyle({ [field]: alignment })}
                className="rounded-md px-1 py-1.5 text-xs text-on-surface-variant focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-surface aria-pressed:text-on-surface aria-pressed:shadow-sm"
              >
                {choices[index]}
              </button>
            ))}
          </div>
        </section>
      ))}
      <ThemeGrid />
      <FontSelector />

      {/* Calendar text size & spacing */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          文字サイズ・余白
        </Label>

        <SliderField
          label="月タイトル"
          value={calendarStyle.monthFontSize}
          min={24}
          max={72}
          onChange={(v) => setCalendarStyle({ monthFontSize: v })}
          warningLevel={getFontWarningLevel(calendarStyle.monthFontSize, 30, 26)}
        />
        <SliderField
          label="日付"
          value={calendarStyle.dayFontSize}
          min={10}
          max={24}
          onChange={(v) => setCalendarStyle({ dayFontSize: v })}
          warningLevel={getFontWarningLevel(calendarStyle.dayFontSize, 12, 11)}
        />
        <SliderField
          label="曜日"
          value={calendarStyle.weekdayFontSize}
          min={10}
          max={20}
          onChange={(v) => setCalendarStyle({ weekdayFontSize: v })}
          warningLevel={getFontWarningLevel(calendarStyle.weekdayFontSize, 11, 10)}
        />
        <SliderField
          label="セル余白"
          value={calendarStyle.cellPadding}
          min={2}
          max={16}
          onChange={(v) => setCalendarStyle({ cellPadding: v })}
        />
        <SliderField
          label="ヘッダー間隔"
          value={calendarStyle.headerGap}
          min={2}
          max={20}
          onChange={(v) => setCalendarStyle({ headerGap: v })}
        />
        <SliderField
          label="上余白"
          value={calendarStyle.pageMarginTop}
          min={0}
          max={80}
          onChange={(v) => setCalendarStyle({ pageMarginTop: v })}
        />
        <SliderField
          label="グリッド幅"
          value={calendarStyle.gridWidth}
          min={50}
          max={100}
          onChange={(v) => setCalendarStyle({ gridWidth: v })}
        />
      </div>
    </div>
  );
}
