import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PreviewArea } from "@/components/preview/PreviewArea";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { useHolidays } from "@/hooks/useHolidays";
import { useFontLoader } from "@/hooks/useFontLoader";
import { useCalendarStore } from "@/stores/calendarStore";
import { FONT_PRESETS } from "@/lib/fonts";

export default function App() {
  useHolidays();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fontId = useCalendarStore((s) => s.fontId);
  const font = FONT_PRESETS.find((f) => f.id === fontId);
  useFontLoader(font?.googleFontsUrl);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden h-full min-h-0 md:block">
          <Sidebar />
        </div>

        <PreviewArea />
      </div>

      {/* Mobile FAB — settings button */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-xl border border-[#dce4e8] bg-white px-5 py-3 text-sm font-semibold text-[#005bc4] shadow-[0_4px_12px_rgba(0,91,196,0.08)] transition-colors hover:bg-[#f8fafc] md:hidden"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        設定
      </button>

      {/* Mobile bottom sheet */}
      <BottomSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <Sidebar mobile />
      </BottomSheet>
    </div>
  );
}
