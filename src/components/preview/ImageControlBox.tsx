import { useState, useEffect } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { AlignGrid } from "@/components/sidebar/AlignGrid";
import { FitModeGrid } from "@/components/sidebar/FitModeGrid";

export function ImageControlBox() {
  const useImages = useCalendarStore((s) => s.useImages);
  const imageFitMode = useCalendarStore((s) => s.imageFitMode);
  const setImageFitMode = useCalendarStore((s) => s.setImageFitMode);
  const calendarStyle = useCalendarStore((s) => s.calendarStyle);
  const setCalendarStyle = useCalendarStore((s) => s.setCalendarStyle);

  // Default: visible on desktop (md+), hidden on mobile
  const [visible, setVisible] = useState(() => window.matchMedia("(min-width: 768px)").matches);

  // Sync default on resize crossing the breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setVisible(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!visible) {
    return (
      <button
        data-testid="image-control-toggle"
        onClick={() => setVisible(true)}
        className="absolute top-4 right-4 z-20 rounded-lg border border-white/40 bg-white/80 p-2 shadow-elevated backdrop-blur-[12px]"
        aria-label="操作パネルを表示"
        title="操作パネルを表示"
      >
        <svg
          className="h-4 w-4 text-on-surface-variant"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75M10.5 18a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5m6-6h6.75M13.5 12a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h7.5"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      data-testid="image-control-box"
      className="absolute top-4 right-4 z-20 w-56 space-y-3 rounded-xl border border-white/40 bg-white/80 p-4 shadow-elevated backdrop-blur-[12px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          配置設定
        </span>
        <button
          data-testid="image-control-toggle"
          onClick={() => setVisible(false)}
          className="rounded-md p-0.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          aria-label="操作パネルを非表示"
          title="操作パネルを非表示"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Fit mode — only when images enabled */}
      {useImages && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            表示方法
          </Label>
          <FitModeGrid fitMode={imageFitMode} onChange={setImageFitMode} />
        </div>
      )}

      {/* Image alignment — only when images enabled */}
      {useImages && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            画像配置
          </Label>
          <AlignGrid
            alignV={calendarStyle.imageAlignV}
            alignH={calendarStyle.imageAlignH}
            onChangeV={(v) => setCalendarStyle({ imageAlignV: v })}
            onChangeH={(h) => setCalendarStyle({ imageAlignH: h })}
          />
        </div>
      )}

      {/* Content alignment — always visible */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          カレンダー配置
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
