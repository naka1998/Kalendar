import { useCallback, useRef, useState } from "react";
import { CROP_MIN_SIZE } from "@/lib/constants";
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

type DragMode = "move" | "resize-br" | null;

/**
 * Calculate how the image fits in the container for the edit preview.
 * During editing, the full image is shown (contain mode) so the user can see
 * the entire image and place the crop frame on it.
 */
function calcImageFit(containerW: number, containerH: number, imageAspectRatio: number) {
  const containerAR = containerW / containerH;
  let imgW: number, imgH: number;
  if (imageAspectRatio > containerAR) {
    imgW = containerW;
    imgH = containerW / imageAspectRatio;
  } else {
    imgH = containerH;
    imgW = containerH * imageAspectRatio;
  }
  const imgX = (containerW - imgW) / 2;
  const imgY = (containerH - imgH) / 2;
  return { imgW, imgH, imgX, imgY };
}

const FIT_MODE_LABELS: Record<FitMode, string> = {
  cover: "短辺に合わせる",
  contain: "長辺に合わせる",
};

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
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startCropX: number;
    startCropY: number;
    startCropW: number;
    startCropH: number;
  } | null>(null);

  const { imgW, imgH, imgX, imgY } = calcImageFit(containerW, containerH, imageAspectRatio);

  // Crop frame in pixel coordinates (relative to the container)
  const frameX = imgX + draft.cropX * imgW;
  const frameY = imgY + draft.cropY * imgH;
  const frameW = draft.cropW * imgW;
  const frameH = draft.cropH * imgH;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: DragMode) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      setDragMode(mode);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startCropX: draft.cropX,
        startCropY: draft.cropY,
        startCropW: draft.cropW,
        startCropH: draft.cropH,
      };
    },
    [draft],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !dragMode) return;

      const deltaX = (e.clientX - dragRef.current.startX) / imgW;
      const deltaY = (e.clientY - dragRef.current.startY) / imgH;

      if (dragMode === "move") {
        const newX = Math.max(
          0,
          Math.min(1 - dragRef.current.startCropW, dragRef.current.startCropX + deltaX),
        );
        const newY = Math.max(
          0,
          Math.min(1 - dragRef.current.startCropH, dragRef.current.startCropY + deltaY),
        );
        onUpdate({ cropX: newX, cropY: newY });
      } else if (dragMode === "resize-br") {
        // Resize from bottom-right corner, maintaining aspect ratio
        const containerAR = containerW / containerH;
        const cropAR = containerAR / imageAspectRatio;

        // Use the larger delta to determine new size
        const rawW = dragRef.current.startCropW + deltaX;
        const rawH = dragRef.current.startCropH + deltaY;
        // Pick the dimension that changed more (in aspect-ratio-corrected terms)
        const useWidth = Math.abs(deltaX / cropAR) > Math.abs(deltaY);
        let newW: number, newH: number;
        if (useWidth) {
          newW = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropX, rawW));
          newH = newW / cropAR;
        } else {
          newH = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropY, rawH));
          newW = newH * cropAR;
        }
        // Clamp
        newW = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropX, newW));
        newH = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropY, newH));

        onUpdate({ cropW: newW, cropH: newH });
      }
    },
    [dragMode, imgW, imgH, containerW, containerH, imageAspectRatio, onUpdate],
  );

  const handlePointerUp = useCallback(() => {
    setDragMode(null);
    dragRef.current = null;
  }, []);

  const handleFitModeToggle = useCallback(() => {
    const newFitMode: FitMode = draft.fitMode === "cover" ? "contain" : "cover";
    onUpdate({ fitMode: newFitMode });
  }, [draft.fitMode, onUpdate]);

  return (
    <div
      data-testid="image-edit-overlay"
      className="absolute inset-0 z-10"
      style={{ touchAction: "none" }}
    >
      {/* Dark overlay with crop frame cutout */}
      {/* Top */}
      <div
        className="absolute bg-black/50"
        style={{ left: 0, top: 0, width: containerW, height: frameY }}
      />
      {/* Bottom */}
      <div
        className="absolute bg-black/50"
        style={{
          left: 0,
          top: frameY + frameH,
          width: containerW,
          height: containerH - frameY - frameH,
        }}
      />
      {/* Left */}
      <div
        className="absolute bg-black/50"
        style={{ left: 0, top: frameY, width: frameX, height: frameH }}
      />
      {/* Right */}
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
        </div>

        {/* Resize handle (bottom-right corner) */}
        <div
          data-testid="crop-resize-handle"
          className="absolute -right-2 -bottom-2 h-4 w-4 cursor-se-resize rounded-full bg-white shadow"
          onPointerDown={(e) => handlePointerDown(e, "resize-br")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      {/* Bottom toolbar */}
      <div
        className="absolute right-0 bottom-0 left-0 z-20 flex items-center gap-2 bg-black/60 px-3 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Fit mode toggle */}
        <button
          data-testid="fit-mode-toggle"
          onClick={handleFitModeToggle}
          className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-white/30"
        >
          {FIT_MODE_LABELS[draft.fitMode]}
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
