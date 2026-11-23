import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { THEMES } from "@/lib/themes";

export function ThemeGrid() {
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
            type="button"
            aria-pressed={themeId === t.id}
            onClick={() => setThemeId(t.id)}
            className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
              themeId === t.id
                ? "ring-2 ring-primary ring-offset-1"
                : "hover:bg-surface-container-high"
            }`}
          >
            <div aria-hidden="true" className="flex gap-0.5">
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.monthLabel }} />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.text }} />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.sunday }} />
              <span className="h-3 w-3 rounded-full" style={{ background: t.colors.saturday }} />
            </div>
            <span className="text-center text-xs font-medium text-on-surface-variant">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
