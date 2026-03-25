import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { A4 } from "@/lib/constants";
import type { PreviewZoom } from "@/stores/types";

const ScaleContext = createContext<number>(1);

export function useScale(): number {
  return useContext(ScaleContext);
}

interface ScaledPageProps {
  children: React.ReactNode;
  scrollViewportHeight: number;
  previewZoom: PreviewZoom;
}

export function ScaledPage({ children, scrollViewportHeight, previewZoom }: ScaledPageProps) {
  const orientation = useCalendarStore((s) => s.orientation);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const pageWidth = orientation === "portrait" ? A4.PORTRAIT_WIDTH_PX : A4.LANDSCAPE_WIDTH_PX;
  const pageHeight = orientation === "portrait" ? A4.PORTRAIT_HEIGHT_PX : A4.LANDSCAPE_HEIGHT_PX;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableWidth = entry.contentRect.width;
        const widthScale = availableWidth / pageWidth;

        let newScale: number;
        if (previewZoom === "large") {
          newScale = Math.min(widthScale, 1);
        } else {
          const padding = 32;
          const effectiveHeight = scrollViewportHeight - padding;
          const heightScale = effectiveHeight > 0 ? effectiveHeight / pageHeight : widthScale;
          const fitScale = Math.min(widthScale, heightScale, 1);
          newScale = previewZoom === "small" ? fitScale * 0.5 : fitScale;
        }

        setScale(newScale);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [pageWidth, pageHeight, previewZoom, scrollViewportHeight]);

  return (
    <div ref={containerRef} className="w-full" style={{ height: pageHeight * scale }}>
      <div
        style={{
          width: pageWidth,
          height: pageHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ScaleContext.Provider value={scale}>{children}</ScaleContext.Provider>
      </div>
    </div>
  );
}
