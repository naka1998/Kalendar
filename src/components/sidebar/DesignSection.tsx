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
        Theme
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
            <span className="text-[9px] font-medium text-on-surface-variant">{t.name}</span>
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
  const imageRatio = useCalendarStore((s) => s.imageRatio);
  const setImageRatio = useCalendarStore((s) => s.setImageRatio);

  return (
    <div className="space-y-4">
      <ThemeGrid />

      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Font
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
          Weight
        </Label>
        <div className="flex rounded-lg bg-surface-container-high p-1">
          {([300, 400, 600] as FontWeight[]).map((w) => {
            const label = w === 300 ? "Light" : w === 400 ? "Regular" : "SemiBold";
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

      {/* Image ratio */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Image / Grid Ratio
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
    </div>
  );
}
