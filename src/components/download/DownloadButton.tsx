import { useCallback, useRef, useState, useEffect } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { generateSingleHtml } from "@/lib/htmlGenerator";
import { generateZip } from "@/lib/zipGenerator";
import { exportSettings } from "@/lib/settingsExport";
import { generateMonthRange } from "@/lib/dateUtils";
import { buildPageData } from "@/lib/buildPageData";
import { FONT_PRESETS } from "@/lib/fonts";
import type { HtmlGeneratorInput, DownloadMode } from "@/stores/types";

function buildInput(store: ReturnType<typeof useCalendarStore.getState>): HtmlGeneratorInput {
  const months = generateMonthRange(store.startMonth, store.endMonth);
  const font = FONT_PRESETS.find((f) => f.id === store.fontId) ?? FONT_PRESETS[0];
  const pages = months.map((monthKey) => buildPageData(monthKey, store));

  return {
    pages,
    orientation: store.orientation,
    fontFamily: font.family,
    fontWeight: store.fontWeight,
    googleFontsUrl: font.googleFontsUrl,
    calendarStyle: {
      contentAlignV: store.calendarStyle.contentAlignV,
      contentAlignH: store.calendarStyle.contentAlignH,
      imageAlignV: store.calendarStyle.imageAlignV,
      imageAlignH: store.calendarStyle.imageAlignH,
      pageMarginTop: store.calendarStyle.pageMarginTop,
    },
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

function openPrintWindow(html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }
  win.onload = () => {
    win.print();
    URL.revokeObjectURL(url);
  };
}

const MODES: { value: DownloadMode; label: string; description: string }[] = [
  { value: "pdf", label: "PDF", description: "印刷ダイアログからPDF保存" },
  { value: "single-html", label: "HTML", description: "単一HTMLファイル（画像埋め込み）" },
  { value: "zip", label: "ZIP", description: "HTML + 画像ファイル" },
];

export function DownloadButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleExport = useCallback(async (mode: DownloadMode) => {
    setMenuOpen(false);
    setDownloading(true);
    try {
      const store = useCalendarStore.getState();
      const input = buildInput(store);
      const settingsJson = exportSettings(store);

      if (mode === "pdf") {
        const html = generateSingleHtml(input);
        openPrintWindow(html);
      } else if (mode === "single-html") {
        const html = generateSingleHtml(input, settingsJson);
        const blob = new Blob([html], { type: "text/html" });
        downloadBlob(blob, "calendar.html");
      } else {
        const blob = await generateZip(input);
        downloadBlob(blob, "calendar.zip");
      }
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={downloading}
        className="rounded-lg bg-[#005bc4] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004ba3] disabled:opacity-50"
      >
        {downloading ? "出力中..." : "出力"}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="glass-panel absolute right-0 top-full z-50 mt-2 w-64 rounded-xl p-1 shadow-lg">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => void handleExport(m.value)}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-container-high"
            >
              <span className="text-sm font-medium text-on-surface">{m.label}</span>
              <span className="text-xs text-on-surface-variant">{m.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
