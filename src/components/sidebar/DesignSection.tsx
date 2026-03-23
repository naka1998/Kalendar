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
import type { FontWeight } from "@/stores/types";

function ThemeGrid() {
  const themeId = useCalendarStore((s) => s.themeId);
  const setThemeId = useCalendarStore((s) => s.setThemeId);

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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
            <span className="text-[10px] font-medium text-on-surface-variant">{t.name}</span>
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
  const imageRatio = useCalendarStore((s) => s.imageRatio);
  const setImageRatio = useCalendarStore((s) => s.setImageRatio);

  return (
    <div className="space-y-4">
      <ThemeGrid />

      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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

      {/* Image ratio — only when images enabled */}
      {useImages && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            画像比率
          </Label>
          <div className="flex rounded-lg bg-surface-container-high p-1">
            {(["60:40", "50:50", "70:30"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setImageRatio(r)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                  imageRatio === r
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
