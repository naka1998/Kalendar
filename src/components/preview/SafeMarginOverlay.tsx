import { SAFE_MARGIN_PX } from "@/lib/constants";

export function SafeMarginOverlay() {
  return (
    <div data-testid="safe-margin-overlay" className="pointer-events-none absolute inset-0 z-10">
      <div
        className="absolute border-2 border-dashed border-red-400/60"
        style={{
          top: SAFE_MARGIN_PX,
          right: SAFE_MARGIN_PX,
          bottom: SAFE_MARGIN_PX,
          left: SAFE_MARGIN_PX,
        }}
      />
      <span
        className="absolute text-[10px] text-red-400/80"
        style={{ top: SAFE_MARGIN_PX + 4, left: SAFE_MARGIN_PX + 4 }}
      >
        印刷安全マージン (5mm)
      </span>
    </div>
  );
}
