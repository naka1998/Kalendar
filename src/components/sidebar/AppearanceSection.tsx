import {
  CALENDAR_LAYOUTS,
  getPresetStyle,
  isPresetAdjusted,
  resolveCalendarLayout,
} from "@/lib/calendarLayouts";
import { useCalendarStore } from "@/stores/calendarStore";
import standardPreview from "../../../screenshots/layouts/standard.png";
import { ThemeGrid } from "./ThemeGrid";
import { FontSelector } from "./FontSelector";

const thumbnails = import.meta.glob<string>("../../../screenshots/layouts/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
export function AppearanceSection() {
  const style = useCalendarStore((s) => s.calendarStyle);
  const themeId = useCalendarStore((s) => s.themeId);
  const holidayMarkStyle = useCalendarStore((s) => s.holidayMarkStyle);
  const fontId = useCalendarStore((s) => s.fontId);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);
  const orientation = useCalendarStore((s) => s.orientation);
  const imagePosition = useCalendarStore((s) => s.imagePosition);
  const layout = resolveCalendarLayout(style.layoutPreset);
  const adjusted = isPresetAdjusted(style);

  return (
    <div className="space-y-4">
      <section aria-label="プリセット" className="space-y-2">
        <h3 className="text-sm font-bold">プリセット</h3>
        <div className="grid grid-cols-2 gap-2">
          {CALENDAR_LAYOUTS.map((preset) => {
            const {
              id,
              label,
              page,
              fontId: presetFontId,
              monthLabelFormat: presetMonthFormat,
            } = preset;
            const appearance = "appearance" in preset ? preset.appearance : undefined;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={layout === id}
                aria-label={label}
                onClick={() =>
                  useCalendarStore.setState((state) => ({
                    calendarStyle: { ...state.calendarStyle, ...getPresetStyle(id) },
                    ...page,
                    ...appearance,
                    fontId: presetFontId,
                    monthLabelFormat: presetMonthFormat,
                  }))
                }
                className="flex min-w-0 flex-col gap-1 rounded-lg border border-transparent bg-surface-container-high p-1.5 text-xs hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-surface"
              >
                <img
                  alt=""
                  loading="lazy"
                  src={thumbnails[`../../../screenshots/layouts/${id}.png`] ?? standardPreview}
                  className="aspect-[5/3] w-full rounded-sm bg-white object-contain"
                />
                <span>{label}</span>
                {layout === id &&
                  (adjusted ||
                    orientation !== page.orientation ||
                    imagePosition !== page.imagePosition ||
                    fontId !== presetFontId ||
                    monthLabelFormat !== presetMonthFormat ||
                    (appearance &&
                      (themeId !== appearance.themeId ||
                        holidayMarkStyle !== appearance.holidayMarkStyle))) && (
                    <span className="text-on-surface-variant">調整済み</span>
                  )}
              </button>
            );
          })}
        </div>
      </section>

      <ThemeGrid />
      <FontSelector />
    </div>
  );
}
