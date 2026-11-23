import { useCalendarStore } from "@/stores/calendarStore";
import { AlignGrid } from "./AlignGrid";
import { FitModeGrid } from "./FitModeGrid";

export function PlacementSettings() {
  const useImages = useCalendarStore((s) => s.useImages);
  const imageFitMode = useCalendarStore((s) => s.imageFitMode);
  const setImageFitMode = useCalendarStore((s) => s.setImageFitMode);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

  return (
    <section aria-label="配置設定" className="space-y-3">
      {useImages && (
        <div role="group" aria-label="表示方法" className="space-y-1.5">
          <h3 className="text-xs font-bold">表示方法</h3>
          <FitModeGrid fitMode={imageFitMode} onChange={setImageFitMode} />
        </div>
      )}

      {useImages && (
        <div role="group" aria-label="画像配置" className="space-y-1.5">
          <h3 className="text-xs font-bold">画像配置</h3>
          <AlignGrid
            alignV={calendarStyle.imageAlignV}
            alignH={calendarStyle.imageAlignH}
            onChangeV={(v) => setCalendarStyle({ imageAlignV: v })}
            onChangeH={(h) => setCalendarStyle({ imageAlignH: h })}
          />
        </div>
      )}

      <div role="group" aria-label="カレンダー配置" className="space-y-1.5">
        <h3 className="text-xs font-bold">カレンダー配置</h3>
        <AlignGrid
          alignV={calendarStyle.contentAlignV}
          alignH={calendarStyle.contentAlignH}
          onChangeV={(v) => setCalendarStyle({ contentAlignV: v })}
          onChangeH={(h) => setCalendarStyle({ contentAlignH: h })}
        />
      </div>
    </section>
  );
}
