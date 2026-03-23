import { useCallback, useRef, useState } from "react";
import type { ImagePosition } from "@/stores/types";
import { isHorizontalLayout } from "@/lib/layoutUtils";
import { IMAGE_PERCENT_MIN, IMAGE_PERCENT_MAX } from "@/lib/constants";

interface UseDividerDragOptions {
  pageWidth: number;
  pageHeight: number;
  scale: number;
  currentPercent: number;
  imagePosition: ImagePosition;
  onPercentCommit: (percent: number) => void;
}

interface UseDividerDragResult {
  dividerProps: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
  isDragging: boolean;
  livePercent: number | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function useDividerDrag({
  pageWidth,
  pageHeight,
  scale,
  currentPercent,
  imagePosition,
  onPercentCommit,
}: UseDividerDragOptions): UseDividerDragResult {
  const [isDragging, setIsDragging] = useState(false);
  const [livePercent, setLivePercent] = useState<number | null>(null);

  const startRef = useRef<{ x: number; y: number; startPercent: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      startRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPercent: currentPercent,
      };
      setIsDragging(true);
      setLivePercent(currentPercent);

      const horizontal = isHorizontalLayout(imagePosition);
      const isReversed = imagePosition === "bottom" || imagePosition === "right";
      const pageSize = horizontal ? pageWidth : pageHeight;

      const handlePointerMove = (ev: PointerEvent) => {
        if (!startRef.current) return;

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          if (!startRef.current) return;

          const deltaScreen = horizontal
            ? ev.clientX - startRef.current.x
            : ev.clientY - startRef.current.y;

          const deltaA4 = deltaScreen / scale;
          let deltaPercent = (deltaA4 / pageSize) * 100;

          if (isReversed) {
            deltaPercent = -deltaPercent;
          }

          const newPercent = clamp(
            startRef.current.startPercent + deltaPercent,
            IMAGE_PERCENT_MIN,
            IMAGE_PERCENT_MAX,
          );
          setLivePercent(newPercent);
        });
      };

      const handlePointerUp = () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        const finalPercent = livePercentRef.current;
        if (finalPercent !== null) {
          onPercentCommit(finalPercent);
        }

        startRef.current = null;
        setIsDragging(false);
        setLivePercent(null);

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [currentPercent, imagePosition, pageWidth, pageHeight, scale, onPercentCommit],
  );

  // Keep a ref to livePercent so the pointerup handler can read the latest value
  const livePercentRef = useRef<number | null>(null);
  livePercentRef.current = livePercent;

  return {
    dividerProps: {
      onPointerDown: handlePointerDown,
    },
    isDragging,
    livePercent,
  };
}
