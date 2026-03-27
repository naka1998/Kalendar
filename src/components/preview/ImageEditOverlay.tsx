import type { ContentAlign, ImageCropSettings } from "@/stores/types";
import type { AspectMode } from "@/lib/cropEditUtils";
import { ASPECT_MODE_LABELS, HANDLE_CURSORS } from "@/lib/cropEditUtils";
import { type ResizeCorner, useCropDrag } from "@/hooks/useCropDrag";

interface ImageEditOverlayProps {
  draft: ImageCropSettings;
  containerW: number;
  containerH: number;
  imageAspectRatio: number;
  onUpdate: (partial: Partial<ImageCropSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: (alignV: ContentAlign, alignH: ContentAlign) => void;
  imageAlignV: ContentAlign;
  imageAlignH: ContentAlign;
}

export function ImageEditOverlay({
  draft,
  containerW,
  containerH,
  imageAspectRatio,
  onUpdate,
  onSave,
  onCancel,
  onReset,
  imageAlignV,
  imageAlignH,
}: ImageEditOverlayProps) {
  const {
    aspectMode,
    frameX,
    frameY,
    frameW,
    frameH,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleAspectModeChange,
  } = useCropDrag({ draft, containerW, containerH, imageAspectRatio, onUpdate });

  const handleClass = "absolute z-30 h-5 w-5 rounded-full bg-white shadow-md md:h-3.5 md:w-3.5";

  const corners: { mode: ResizeCorner; posClass: string }[] = [
    { mode: "resize-tl", posClass: "-left-2.5 -top-2.5 md:-left-1.5 md:-top-1.5" },
    { mode: "resize-tr", posClass: "-right-2.5 -top-2.5 md:-right-1.5 md:-top-1.5" },
    { mode: "resize-bl", posClass: "-left-2.5 -bottom-2.5 md:-left-1.5 md:-bottom-1.5" },
    { mode: "resize-br", posClass: "-right-2.5 -bottom-2.5 md:-right-1.5 md:-bottom-1.5" },
  ];

  return (
    <div
      data-testid="image-edit-overlay"
      className="absolute inset-0 z-10"
      style={{ touchAction: "none" }}
    >
      {/* Dark overlay with crop frame cutout */}
      <div
        className="absolute bg-black/50"
        style={{ left: 0, top: 0, width: containerW, height: frameY }}
      />
      <div
        className="absolute bg-black/50"
        style={{
          left: 0,
          top: frameY + frameH,
          width: containerW,
          height: containerH - frameY - frameH,
        }}
      />
      <div
        className="absolute bg-black/50"
        style={{ left: 0, top: frameY, width: frameX, height: frameH }}
      />
      <div
        className="absolute bg-black/50"
        style={{
          left: frameX + frameW,
          top: frameY,
          width: containerW - frameX - frameW,
          height: frameH,
        }}
      />

      {/* Crop frame border */}
      <div
        data-testid="crop-frame"
        className="absolute cursor-move"
        style={{
          left: frameX,
          top: frameY,
          width: frameW,
          height: frameH,
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
        }}
        onPointerDown={(e) => handlePointerDown(e, "move")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid lines (rule of thirds) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 right-0 left-0 h-px bg-white/30" />
          <div className="absolute top-2/3 right-0 left-0 h-px bg-white/30" />
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/30" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/30" />
        </div>

        {/* Four corner resize handles */}
        {corners.map(({ mode, posClass }) => (
          <div
            key={mode}
            data-testid={`crop-${mode}`}
            className={`${handleClass} ${posClass} ${HANDLE_CURSORS[mode]}`}
            onPointerDown={(e) => handlePointerDown(e, mode)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        ))}
      </div>

      {/* Bottom toolbar */}
      <div
        className="absolute right-0 bottom-0 left-0 z-20 flex flex-wrap items-center gap-2 bg-black/60 px-3 py-2 md:flex-nowrap md:gap-2 md:px-3 md:py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Aspect ratio mode buttons */}
        {(["free", "original", "square"] as AspectMode[]).map((mode) => (
          <button
            key={mode}
            data-testid={`aspect-mode-${mode}`}
            onClick={() => handleAspectModeChange(mode)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-all md:px-2 md:py-0.5 md:text-[10px] ${
              aspectMode === mode
                ? "bg-white/40 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {ASPECT_MODE_LABELS[mode]}
          </button>
        ))}

        <div className="flex-1" />

        {/* Reset */}
        <button
          data-testid="crop-reset"
          onClick={() => onReset(imageAlignV, imageAlignH)}
          className="rounded bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 md:px-2 md:py-0.5 md:text-[10px]"
        >
          リセット
        </button>

        {/* Cancel */}
        <button
          data-testid="crop-cancel"
          onClick={onCancel}
          className="rounded bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 md:px-2 md:py-0.5 md:text-[10px]"
        >
          キャンセル
        </button>

        {/* Save */}
        <button
          data-testid="crop-save"
          onClick={onSave}
          className="rounded bg-white/90 px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-white md:px-2 md:py-0.5 md:text-[10px]"
        >
          保存
        </button>
      </div>
    </div>
  );
}
