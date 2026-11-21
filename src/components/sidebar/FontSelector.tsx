import { useEffect } from "react";
import { Check } from "lucide-react";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { FONT_CATEGORIES, FONT_PRESETS } from "@/lib/fonts";
import type { FontWeight } from "@/stores/types";

const fontPickerUrl = new URL("https://fonts.googleapis.com/css2");
for (const font of FONT_PRESETS) {
  const family = new URL(font.googleFontsUrl).searchParams.get("family");
  if (family) fontPickerUrl.searchParams.append("family", family);
}
fontPickerUrl.searchParams.set("display", "swap");

export function FontSelector() {
  const fontId = useCalendarStore((s) => s.fontId);
  const setFontId = useCalendarStore((s) => s.setFontId);
  const fontWeight = useCalendarStore((s) => s.fontWeight);
  const setFontWeight = useCalendarStore((s) => s.setFontWeight);

  const selectedFont = FONT_PRESETS.find((font) => font.id === fontId) ?? FONT_PRESETS[0];

  useEffect(() => {
    // Keep the sample stylesheet separate from the selected calendar font.
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontPickerUrl.href;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <>
      {/* Font family */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          フォント
        </Label>
        {FONT_CATEGORIES.map((category) => (
          <section key={category} aria-label={category} className="space-y-1">
            <h3 className="text-xs font-semibold text-on-surface-variant">{category}</h3>
            <div className="grid grid-cols-3 gap-2">
              {FONT_PRESETS.filter((font) => font.category === category).map((font) => (
                <button
                  key={font.id}
                  type="button"
                  aria-pressed={font.id === selectedFont.id}
                  onClick={() => setFontId(font.id)}
                  className="relative flex min-w-0 flex-col items-center gap-1 rounded-lg border border-transparent bg-surface-container-high px-1 pt-3 pb-2 hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-surface"
                >
                  {font.id === selectedFont.id && (
                    <Check
                      aria-hidden="true"
                      className="absolute top-0.5 right-0.5 size-3 text-primary"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="text-center text-xs leading-tight font-extrabold"
                    style={{ fontFamily: `"${font.family}"` }}
                  >
                    2027 月 6
                  </span>
                  <span className="min-w-0 text-center text-xs leading-tight text-on-surface-variant [overflow-wrap:anywhere]">
                    {font.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
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
