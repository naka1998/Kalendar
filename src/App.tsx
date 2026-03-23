import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PreviewArea } from "@/components/preview/PreviewArea";
import { useHolidays } from "@/hooks/useHolidays";
import { useFontLoader } from "@/hooks/useFontLoader";
import { useCalendarStore } from "@/stores/calendarStore";
import { FONT_PRESETS } from "@/lib/fonts";

export default function App() {
  useHolidays();

  const fontId = useCalendarStore((s) => s.fontId);
  const font = FONT_PRESETS.find((f) => f.id === fontId);
  useFontLoader(font?.googleFontsUrl);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <PreviewArea />
      </div>
    </div>
  );
}
