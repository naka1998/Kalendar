import { useCallback, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { generateSingleHtml } from "@/lib/htmlGenerator";
import { generateZip } from "@/lib/zipGenerator";
import {
  generateMonthRange,
  getMonthGrid,
  getWeekdayHeaders,
  formatMonthLabel,
  enrichDayCells,
} from "@/lib/dateUtils";
import { mergeHolidays } from "@/lib/holidayUtils";
import { resolveTheme } from "@/lib/themeUtils";
import { THEMES } from "@/lib/themes";
import { FONT_PRESETS } from "@/lib/fonts";
import type { HtmlGeneratorInput, PageData, DownloadMode } from "@/stores/types";

function buildInput(store: ReturnType<typeof useCalendarStore.getState>): HtmlGeneratorInput {
  const months = generateMonthRange(store.startMonth, store.endMonth);
  const holidays = mergeHolidays(store.apiHolidays, store.manualHolidays, store.removedHolidays);
  const font = FONT_PRESETS.find((f) => f.id === store.fontId) ?? FONT_PRESETS[0];

  const pages: PageData[] = months.map((monthKey) => {
    const rawGrid = getMonthGrid(monthKey, store.weekStart);
    const grid = enrichDayCells(rawGrid, holidays);
    const theme = resolveTheme(store.themeId, monthKey, store.monthThemeOverrides, THEMES);

    return {
      monthLabel: formatMonthLabel(monthKey, store.monthLabelFormat),
      grid,
      weekdayHeaders: getWeekdayHeaders(store.weekdayFormat, store.weekStart),
      theme,
      holidayMarkStyle: store.holidayMarkStyle,
      imageBase64: store.images[monthKey]?.base64 ?? null,
      imageRatio: store.imageRatio,
    };
  });

  return {
    pages,
    orientation: store.orientation,
    fontFamily: font.family,
    fontWeight: store.fontWeight,
    googleFontsUrl: font.googleFontsUrl,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DownloadButton() {
  const [mode, setMode] = useState<DownloadMode>("single-html");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const store = useCalendarStore.getState();
      const input = buildInput(store);

      if (mode === "single-html") {
        const html = generateSingleHtml(input);
        const blob = new Blob([html], { type: "text/html" });
        downloadBlob(blob, "calendar.html");
      } else {
        const blob = await generateZip(input);
        downloadBlob(blob, "calendar.zip");
      }
    } finally {
      setDownloading(false);
    }
  }, [mode]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg bg-surface-container-high p-0.5">
        <button
          onClick={() => setMode("single-html")}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
            mode === "single-html"
              ? "bg-surface text-on-surface shadow-sm"
              : "text-on-surface-variant"
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setMode("zip")}
          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
            mode === "zip" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant"
          }`}
        >
          ZIP
        </button>
      </div>
      <button
        onClick={() => void handleDownload()}
        disabled={downloading}
        className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {downloading ? "エクスポート中..." : "エクスポート"}
      </button>
    </div>
  );
}
