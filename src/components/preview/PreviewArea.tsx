import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { generateMonthRange, formatMonthLabel } from "@/lib/dateUtils";
import { CalendarPageContainer } from "./CalendarPageContainer";

export function PreviewArea() {
  const startMonth = useCalendarStore((s) => s.startMonth);
  const endMonth = useCalendarStore((s) => s.endMonth);
  const monthLabelFormat = useCalendarStore((s) => s.monthLabelFormat);

  const months = useMemo(() => generateMonthRange(startMonth, endMonth), [startMonth, endMonth]);

  const [activeMonth, setActiveMonth] = useState(months[0] ?? "");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
        <div className="flex flex-wrap gap-1">
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
      </div>

      {/* Scrollable preview */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          {months.map((monthKey) => (
            <div key={monthKey} ref={setPageRef(monthKey)} data-month={monthKey}>
              <CalendarPageContainer monthKey={monthKey} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
