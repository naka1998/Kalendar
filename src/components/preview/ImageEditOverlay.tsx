import { useCallback, useRef } from "react";
import { IMAGE_SCALE_MIN, IMAGE_SCALE_MAX } from "@/lib/constants";
import { clampOffset } from "@/lib/cropUtils";
import type { ContentAlign, FitMode, ImageCropSettings } from "@/stores/types";

interface ImageEditOverlayProps {
  draft: ImageCropSettings;
  containerW: number;
  containerH: number;
  imageAspectRatio: number;
  onUpdate: (partial: Partial<ImageCropSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: (imageAlign: ContentAlign) => void;
  imageAlign: ContentAlign;
}

function calcMaxTranslate(
  crop: ImageCropSettings,
  containerW: number,
  containerH: number,
  imageAspectRatio: number,
): { maxTx: number; maxTy: number } {
  const containerAR = containerW / containerH;
  let baseW: number, baseH: number;

  if (crop.fitMode === "cover") {
    if (imageAspectRatio > containerAR) {
      baseH = containerH;
      baseW = containerH * imageAspectRatio;
    } else {
      baseW = containerW;
      baseH = containerW / imageAspectRatio;
    }
  } else {
    if (imageAspectRatio > containerAR) {
      baseW = containerW;
      baseH = containerW / imageAspectRatio;
    } else {
      baseH = containerH;
      baseW = containerH * imageAspectRatio;
    }
  }

  const displayW = baseW * crop.scale;
  const displayH = baseH * crop.scale;

  return {
    maxTx: Math.abs(displayW - containerW) / 2,
    maxTy: Math.abs(displayH - containerH) / 2,
  };
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
  imageAlign,
}: ImageEditOverlayProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: draft.offsetX,
        startOffsetY: draft.offsetY,
      };
    },
    [draft.offsetX, draft.offsetY],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const { maxTx, maxTy } = calcMaxTranslate(draft, containerW, containerH, imageAspectRatio);

      const newOffsetX =
        maxTx > 0
          ? clampOffset(dragRef.current.startOffsetX - deltaX / maxTx)
          : dragRef.current.startOffsetX;
      const newOffsetY =
        maxTy > 0
          ? clampOffset(dragRef.current.startOffsetY - deltaY / maxTy)
          : dragRef.current.startOffsetY;

      onUpdate({ offsetX: newOffsetX, offsetY: newOffsetY });
    },
    [draft, containerW, containerH, imageAspectRatio, onUpdate],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleScaleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ scale: parseFloat(e.target.value) });
    },
    [onUpdate],
  );

  const handleFitModeToggle = useCallback(() => {
    const newFitMode: FitMode = draft.fitMode === "cover" ? "contain" : "cover";
    onUpdate({ fitMode: newFitMode });
  }, [draft.fitMode, onUpdate]);

  const scalePercent = Math.round(draft.scale * 100);

  return (
    <div
      data-testid="image-edit-overlay"
      className="absolute inset-0 z-10"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Bottom toolbar */}
      <div
        className="absolute right-0 bottom-0 left-0 z-20 flex items-center gap-2 bg-black/60 px-3 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Scale slider */}
        <label className="flex items-center gap-1.5 text-[10px] text-white">
          <span className="whitespace-nowrap">{scalePercent}%</span>
          <input
            data-testid="scale-slider"
            type="range"
            min={IMAGE_SCALE_MIN}
            max={IMAGE_SCALE_MAX}
            step={0.05}
            value={draft.scale}
            onChange={handleScaleChange}
            className="h-1 w-16 cursor-pointer accent-white"
          />
        </label>

        {/* Fit mode toggle */}
        <button
          data-testid="fit-mode-toggle"
          onClick={handleFitModeToggle}
          className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30"
        >
          {draft.fitMode}
        </button>

        <div className="flex-1" />

        {/* Reset */}
        <button
          data-testid="crop-reset"
          onClick={() => onReset(imageAlign)}
          className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30"
        >
          リセット
        </button>

        {/* Cancel */}
        <button
          data-testid="crop-cancel"
          onClick={onCancel}
          className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30"
        >
          キャンセル
        </button>

        {/* Save */}
        <button
          data-testid="crop-save"
          onClick={onSave}
          className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-medium text-on-surface hover:bg-white"
        >
          保存
        </button>
      </div>
    </div>
  );
}
