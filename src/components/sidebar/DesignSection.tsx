import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEMES } from "@/lib/themes";
import { FONT_PRESETS } from "@/lib/fonts";
import type { ContentAlign, FontWeight } from "@/stores/types";

function ThemeGrid() {
  const themeId = useCalendarStore((s) => s.themeId);
  const setThemeId = useCalendarStore((s) => s.setThemeId);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        テーマ
      </Label>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
              themeId === t.id
                ? "ring-2 ring-primary ring-offset-1"
                : "hover:bg-surface-container-high"
            }`}
          >
            {/* Color preview dots */}
            <div className="flex gap-0.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: t.colors.background, border: "1px solid #d1d5db" }}
              />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.text }} />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.sunday }} />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.saturday }} />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DesignSection() {
  const fontId = useCalendarStore((s) => s.fontId);
  const setFontId = useCalendarStore((s) => s.setFontId);
  const fontWeight = useCalendarStore((s) => s.fontWeight);
  const setFontWeight = useCalendarStore((s) => s.setFontWeight);
  const useImages = useCalendarStore((s) => s.useImages);
  const setUseImages = useCalendarStore((s) => s.setUseImages);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

  return (
    <div className="space-y-4">
      <ThemeGrid />

      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          フォント
        </Label>
        <Select
          value={fontId}
          onValueChange={(v) => {
            if (v) setFontId(v);
          }}
        >
          <SelectTrigger className="border-none bg-surface-container-high text-sm focus:bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_PRESETS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font weight */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          太さ
        </Label>
        <div className="flex rounded-lg bg-surface-container-high p-1">
          {([300, 400, 600] as FontWeight[]).map((w) => {
            const label = w === 300 ? "細字" : w === 400 ? "標準" : "太字";
            return (
              <button
                key={w}
                onClick={() => setFontWeight(w)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  fontWeight === w
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Image toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          画像を使用
        </Label>
        <button
          onClick={() => setUseImages(!useImages)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            useImages ? "bg-primary" : "bg-surface-container-highest"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              useImages ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

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
        />
        <SliderField
          label="日付"
          value={calendarStyle.dayFontSize}
          min={10}
          max={24}
          onChange={(v) => setCalendarStyle({ dayFontSize: v })}
        />
        <SliderField
          label="曜日"
          value={calendarStyle.weekdayFontSize}
          min={10}
          max={20}
          onChange={(v) => setCalendarStyle({ weekdayFontSize: v })}
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
      </div>

      {/* Content alignment */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          配置揃え
        </Label>
        <div className="flex rounded-lg bg-surface-container-high p-1">
          {(["start", "center", "end"] as ContentAlign[]).map((a) => {
            const label = a === "start" ? "上揃え" : a === "center" ? "中央" : "下揃え";
            return (
              <button
                key={a}
                onClick={() => setCalendarStyle({ contentAlign: a })}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  calendarStyle.contentAlign === a
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-on-surface-variant">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-surface-container-high accent-[#005bc4]"
      />
      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-on-surface">{value}</span>
    </div>
  );
}
