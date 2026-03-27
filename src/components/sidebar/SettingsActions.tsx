import { useCallback, useRef } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { importFromHtmlFile } from "@/lib/htmlImporter";
import { clearStorage } from "@/lib/storageService";
import { Button } from "@/components/ui/button";

export function SettingsActions() {
  const htmlInputRef = useRef<HTMLInputElement>(null);

  const handleHtmlImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void importFromHtmlFile(file).then((settings) => {
      if (settings) {
        useCalendarStore.setState((prev) => ({ ...prev, ...settings }));
      } else {
        console.error("No settings found in HTML file");
      }
    });
    if (htmlInputRef.current) htmlInputRef.current.value = "";
  }, []);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => htmlInputRef.current?.click()}
      >
        HTMLから読込
      </Button>
      <input
        ref={htmlInputRef}
        type="file"
        accept=".html,.htm"
        className="hidden"
        onChange={handleHtmlImport}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
        onClick={() => {
          if (window.confirm("カレンダーの設定をすべて初期状態に戻します。よろしいですか？")) {
            clearStorage();
            useCalendarStore.getState().resetCalendar();
          }
        }}
      >
        カレンダーをリセット
      </Button>
    </div>
  );
}
