import { CALENDAR_LAYOUTS, resolveCalendarLayout } from "@/lib/calendarLayouts";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { ThemeGrid } from "./ThemeGrid";
import { FontSelector } from "./FontSelector";
import { SliderField, getFontWarningLevel } from "./SliderField";

export function AppearanceSection() {
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

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
              onClick={() => setCalendarStyle({ layoutPreset: id })}
              className="rounded-lg border border-transparent bg-surface-container-high px-2 py-2 text-xs hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-surface"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
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
