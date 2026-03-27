import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_PRESETS } from "@/lib/fonts";
import type { FontWeight } from "@/stores/types";

export function FontSelector() {
  const fontId = useCalendarStore((s) => s.fontId);
  const setFontId = useCalendarStore((s) => s.setFontId);
  const fontWeight = useCalendarStore((s) => s.fontWeight);
  const setFontWeight = useCalendarStore((s) => s.setFontWeight);

  return (
    <>
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
          <SelectTrigger
            aria-label="フォント"
            className="border-none bg-surface-container-high text-sm focus:bg-surface"
          >
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
    </>
  );
}
