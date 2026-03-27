import { useCallback, useRef, useState } from "react";
import { CROP_MIN_SIZE } from "@/lib/constants";
import type { ImageCropSettings } from "@/stores/types";
import {
  type AspectMode,
  calcImageFit,
  getAspectRatio,
  adjustCropToAspect,
} from "@/lib/cropEditUtils";

export type ResizeCorner = "resize-tl" | "resize-tr" | "resize-bl" | "resize-br";
export type DragMode = "move" | ResizeCorner | null;

interface UseCropDragOptions {
  draft: ImageCropSettings;
  containerW: number;
  containerH: number;
  imageAspectRatio: number;
  onUpdate: (partial: Partial<ImageCropSettings>) => void;
}

export function useCropDrag({
  draft,
  containerW,
  containerH,
  imageAspectRatio,
  onUpdate,
}: UseCropDragOptions) {
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [aspectMode, setAspectMode] = useState<AspectMode>("original");
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
      const s = dragRef.current;

      if (dragMode === "move") {
        const newX = Math.max(0, Math.min(1 - s.startCropW, s.startCropX + deltaX));
        const newY = Math.max(0, Math.min(1 - s.startCropH, s.startCropY + deltaY));
        onUpdate({ cropX: newX, cropY: newY });
        return;
      }

      // Resize from a corner
      const targetAR = getAspectRatio(aspectMode, imageAspectRatio);

      // Determine which edges move based on the corner
      const moveLeft = dragMode === "resize-tl" || dragMode === "resize-bl";
      const moveTop = dragMode === "resize-tl" || dragMode === "resize-tr";
      const dx = moveLeft ? -deltaX : deltaX;
      const dy = moveTop ? -deltaY : deltaY;

      if (targetAR === null) {
        // Free mode
        let newW = Math.max(CROP_MIN_SIZE, s.startCropW + dx);
        let newH = Math.max(CROP_MIN_SIZE, s.startCropH + dy);
        let newX = moveLeft ? s.startCropX + s.startCropW - newW : s.startCropX;
        let newY = moveTop ? s.startCropY + s.startCropH - newH : s.startCropY;
        // Clamp within image bounds
        if (newX < 0) {
          newW += newX;
          newX = 0;
        }
        if (newY < 0) {
          newH += newY;
          newY = 0;
        }
        if (newX + newW > 1) newW = 1 - newX;
        if (newY + newH > 1) newH = 1 - newY;
        newW = Math.max(CROP_MIN_SIZE, newW);
        newH = Math.max(CROP_MIN_SIZE, newH);
        onUpdate({ cropX: newX, cropY: newY, cropW: newW, cropH: newH });
      } else {
        // Constrained mode
        const cropAR = targetAR / imageAspectRatio;
        const diag = dx + dy * cropAR;
        let newW = Math.max(CROP_MIN_SIZE, s.startCropW + diag / 2);
        let newH = newW / cropAR;
        newW = Math.max(CROP_MIN_SIZE, Math.min(1, newW));
        newH = Math.max(CROP_MIN_SIZE, Math.min(1, newH));
        if (newW / newH > cropAR) newW = newH * cropAR;
        else newH = newW / cropAR;

        let newX = moveLeft ? s.startCropX + s.startCropW - newW : s.startCropX;
        let newY = moveTop ? s.startCropY + s.startCropH - newH : s.startCropY;
        if (newX < 0) {
          newX = 0;
          newW = Math.min(1, s.startCropX + s.startCropW);
          newH = newW / cropAR;
        }
        if (newY < 0) {
          newY = 0;
          newH = Math.min(1, s.startCropY + s.startCropH);
          newW = newH * cropAR;
        }
        if (newX + newW > 1) {
          newW = 1 - newX;
          newH = newW / cropAR;
        }
        if (newY + newH > 1) {
          newH = 1 - newY;
          newW = newH * cropAR;
        }
        onUpdate({ cropX: newX, cropY: newY, cropW: newW, cropH: newH });
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

  return {
    dragMode,
    aspectMode,
    frameX,
    frameY,
    frameW,
    frameH,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleAspectModeChange,
  };
}
