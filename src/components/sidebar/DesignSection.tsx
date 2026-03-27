import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { ThemeGrid } from "./ThemeGrid";
import { FontSelector } from "./FontSelector";
import { SliderField, getFontWarningLevel } from "./SliderField";
import { AlignGrid } from "./AlignGrid";
import { FitModeGrid } from "./FitModeGrid";

export function DesignSection() {
  const useImages = useCalendarStore((s) => s.useImages);
  const setUseImages = useCalendarStore((s) => s.setUseImages);
  const imageFitMode = useCalendarStore((s) => s.imageFitMode);
  const setImageFitMode = useCalendarStore((s) => s.setImageFitMode);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

  return (
    <div className="space-y-4">
      <ThemeGrid />
      <FontSelector />

      {/* Image toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          画像を使用
        </Label>
        <button
          aria-label="画像を使用"
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

      {/* Image alignment — only when images enabled */}
      {useImages && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            画像揃え
          </Label>
          <AlignGrid
            alignV={calendarStyle.imageAlignV}
            alignH={calendarStyle.imageAlignH}
            onChangeV={(v) => setCalendarStyle({ imageAlignV: v })}
            onChangeH={(h) => setCalendarStyle({ imageAlignH: h })}
          />
        </div>
      )}

      {/* Image fit mode — only when images enabled */}
      {useImages && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            表示方法
          </Label>
          <FitModeGrid fitMode={imageFitMode} onChange={setImageFitMode} />
        </div>
      )}

      {/* Content alignment */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          配置揃え
        </Label>
        <AlignGrid
          alignV={calendarStyle.contentAlignV}
          alignH={calendarStyle.contentAlignH}
          onChangeV={(v) => setCalendarStyle({ contentAlignV: v })}
          onChangeH={(h) => setCalendarStyle({ contentAlignH: h })}
        />
      </div>
    </div>
  );
}
