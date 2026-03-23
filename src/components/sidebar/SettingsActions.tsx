import { useCallback, useRef } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { exportSettings, importSettings } from "@/lib/settingsExport";
import { Button } from "@/components/ui/button";

export function SettingsActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const state = useCalendarStore.getState();
    const json = exportSettings(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calendar-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const settings = importSettings(reader.result as string);
        useCalendarStore.setState(settings);
      } catch (err) {
        console.error("Failed to import settings:", err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleExport}>
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
