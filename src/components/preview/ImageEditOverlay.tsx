import { useCallback, useRef, useState } from "react";
import { CROP_MIN_SIZE } from "@/lib/constants";
import type { ContentAlign, ImageCropSettings } from "@/stores/types";

type AspectMode = "free" | "original" | "square";

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

function getAspectRatio(mode: AspectMode, imageAspectRatio: number): number | null {
  if (mode === "free") return null;
  if (mode === "original") return imageAspectRatio;
  return 1; // square
}

function adjustCropToAspect(
  crop: ImageCropSettings,
  targetAR: number | null,
  imageAspectRatio: number,
): Partial<ImageCropSettings> {
  if (targetAR === null) return {};
  // targetAR is in real-world coords; in image-relative coords:
  // cropW_real / cropH_real = targetAR
  // cropW_real = cropW * imgW, cropH_real = cropH * imgH
  // (cropW * imgW) / (cropH * imgH) = targetAR
  // cropW / cropH = targetAR / imageAspectRatio
  const cropAR = targetAR / imageAspectRatio;
  const centerX = crop.cropX + crop.cropW / 2;
  const centerY = crop.cropY + crop.cropH / 2;

  let newW: number, newH: number;
  if (cropAR >= 1) {
    newW = Math.min(1, crop.cropW);
    newH = newW / cropAR;
    if (newH > 1) {
      newH = 1;
      newW = newH * cropAR;
    }
  } else {
    newH = Math.min(1, crop.cropH);
    newW = newH * cropAR;
    if (newW > 1) {
      newW = 1;
      newH = newW / cropAR;
    }
  }

  newW = Math.max(CROP_MIN_SIZE, newW);
  newH = Math.max(CROP_MIN_SIZE, newH);

  const newX = Math.max(0, Math.min(1 - newW, centerX - newW / 2));
  const newY = Math.max(0, Math.min(1 - newH, centerY - newH / 2));

  return { cropX: newX, cropY: newY, cropW: newW, cropH: newH };
}

const ASPECT_MODE_LABELS: Record<AspectMode, string> = {
  free: "フリー",
  original: "オリジナル",
  square: "1:1",
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
  const [aspectMode, setAspectMode] = useState<AspectMode>("free");
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startCropX: number;
    startCropY: number;
    startCropW: number;
    startCropH: number;
  } | null>(null);

  const { imgW, imgH, imgX, imgY } = calcImageFit(containerW, containerH, imageAspectRatio);

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
        const targetAR = getAspectRatio(aspectMode, imageAspectRatio);

        if (targetAR === null) {
          // Free mode: resize independently
          const newW = Math.max(
            CROP_MIN_SIZE,
            Math.min(1 - dragRef.current.startCropX, dragRef.current.startCropW + deltaX),
          );
          const newH = Math.max(
            CROP_MIN_SIZE,
            Math.min(1 - dragRef.current.startCropY, dragRef.current.startCropH + deltaY),
          );
          onUpdate({ cropW: newW, cropH: newH });
        } else {
          // Constrained: use diagonal movement to determine size
          const cropAR = targetAR / imageAspectRatio;
          const diag = deltaX + deltaY * cropAR;
          let newW = Math.max(CROP_MIN_SIZE, dragRef.current.startCropW + diag / 2);
          let newH = newW / cropAR;
          newW = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropX, newW));
          newH = Math.max(CROP_MIN_SIZE, Math.min(1 - dragRef.current.startCropY, newH));
          // Re-enforce ratio after clamping
          if (newW / newH > cropAR) {
            newW = newH * cropAR;
          } else {
            newH = newW / cropAR;
          }
          onUpdate({ cropW: newW, cropH: newH });
        }
      }
    },
    [dragMode, imgW, imgH, aspectMode, imageAspectRatio, onUpdate],
  );

  const handlePointerUp = useCallback(() => {
    setDragMode(null);
    dragRef.current = null;
  }, []);

  const handleAspectModeChange = useCallback(
    (mode: AspectMode) => {
      setAspectMode(mode);
      const ar = getAspectRatio(mode, imageAspectRatio);
      if (ar !== null) {
        onUpdate(adjustCropToAspect(draft, ar, imageAspectRatio));
      }
    },
    [draft, imageAspectRatio, onUpdate],
  );

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
        {/* Aspect ratio mode buttons */}
        {(["free", "original", "square"] as AspectMode[]).map((mode) => (
          <button
            key={mode}
            data-testid={`aspect-mode-${mode}`}
            onClick={() => handleAspectModeChange(mode)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
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
