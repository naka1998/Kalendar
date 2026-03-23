import { useEffect, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { A4 } from "@/lib/constants";

export function ScaledPage({ children }: { children: React.ReactNode }) {
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
        setScale(Math.min(availableWidth / pageWidth, 1));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [pageWidth]);

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
        {children}
      </div>
    </div>
  );
}
