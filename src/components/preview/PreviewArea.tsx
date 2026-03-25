import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { generateMonthRange, formatMonthLabel } from "@/lib/dateUtils";
import { CalendarPageContainer } from "./CalendarPageContainer";
import { ScaledPage } from "./ScaledPage";
import type { PreviewZoom } from "@/stores/types";

const ZOOM_OPTIONS: { value: PreviewZoom; label: string }[] = [
  { value: "large", label: "大" },
  { value: "standard", label: "標準" },
  { value: "small", label: "小" },
];

export function PreviewArea() {
  const startMonth = useCalendarStore((s) => s.startMonth);
  const endMonth = useCalendarStore((s) => s.endMonth);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);
  const showSafeMargin = useCalendarStore((s) => s.showSafeMargin);
  const setShowSafeMargin = useCalendarStore((s) => s.setShowSafeMargin);
  const previewZoom = useCalendarStore((s) => s.previewZoom);
  const setPreviewZoom = useCalendarStore((s) => s.setPreviewZoom);

  const months = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth]);

  const [activeMonth, setActiveMonth] = useState(months[0] ?? "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);

  // Measure scroll container viewport height
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScrollViewportHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver to detect current visible month
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const monthKey = entry.target.getAttribute("data-month");
            if (monthKey) setActiveMonth(monthKey);
          }
        }
      },
      {
        root: container,
        threshold: 0.3,
      },
    );

    for (const el of pageRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [months]);

  const setPageRef = useCallback(
    (monthKey: string) => (el: HTMLDivElement | null) => {
      if (el) {
        pageRefs.current.set(monthKey, el);
      } else {
        pageRefs.current.delete(monthKey);
      }
    },
    [],
  );

  const jumpToMonth = (monthKey: string) => {
    const el = pageRefs.current.get(monthKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (months.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-surface-container">
        <p className="text-on-surface-variant">
          無効な期間です。終了月は開始月より後にしてください。
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-surface-container">
      {/* Month jump navigation */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 bg-surface-container-low px-6 py-2">
        <span className="mr-2 text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          {formatMonthLabel(activeMonth, monthLabelFormat)}
        </span>
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {months.map((m) => {
            const [, mm] = m.split("-");
            return (
              <button
                key={m}
                onClick={() => jumpToMonth(m)}
                className={`rounded-md px-2 py-0.5 text-xs transition-all ${
                  m === activeMonth
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {mm}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="flex rounded-lg bg-surface-container-high p-0.5">
            {ZOOM_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                data-testid={`zoom-${value}`}
                onClick={() => setPreviewZoom(value)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition-all ${
                  previewZoom === value
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSafeMargin(!showSafeMargin)}
            className={`shrink-0 rounded-md px-2 py-0.5 text-xs transition-all ${
              showSafeMargin
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            title="印刷セーフマージンを表示"
          >
            余白ガイド
          </button>
        </div>
      </div>

      {/* Scrollable preview */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8">
        <div
          className={`mx-auto ${
            previewZoom === "small"
              ? "grid max-w-5xl grid-cols-2 gap-4"
              : previewZoom === "large"
                ? "flex flex-col gap-8"
                : "flex max-w-5xl flex-col gap-8"
          }`}
        >
          {months.map((monthKey) => (
            <div key={monthKey} ref={setPageRef(monthKey)} data-month={monthKey}>
              <ScaledPage scrollViewportHeight={scrollViewportHeight} previewZoom={previewZoom}>
                <CalendarPageContainer monthKey={monthKey} />
              </ScaledPage>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
