import { useCallback, useEffect, useRef, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { exportSettings, importSettings } from "@/lib/settingsExport";
import { importFromHtmlFile } from "@/lib/htmlImporter";
import { saveToStorage, loadFromStorage, hasSavedData } from "@/lib/storageService";
import { Button } from "@/components/ui/button";

export function SettingsActions() {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasSaved(hasSavedData());
  }, []);

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

  const handleJsonImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (jsonInputRef.current) jsonInputRef.current.value = "";
  }, []);

  const handleHtmlImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void importFromHtmlFile(file).then((settings) => {
      if (settings) {
        useCalendarStore.setState(settings);
      } else {
        console.error("No settings found in HTML file");
      }
    });
    if (htmlInputRef.current) htmlInputRef.current.value = "";
  }, []);

  const handleTempSave = useCallback(() => {
    const state = useCalendarStore.getState();
    const result = saveToStorage(state);
    if (result.success) {
      setHasSaved(true);
      setSaveMessage("保存しました");
    } else {
      setSaveMessage(result.error ?? "保存に失敗しました");
    }
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const handleTempLoad = useCallback(() => {
    if (!window.confirm("保存済みデータで現在の設定を上書きしますか？")) return;

    const loaded = loadFromStorage();
    if (loaded) {
      useCalendarStore.setState(loaded);
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleExport}>
          設定を保存
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => jsonInputRef.current?.click()}
        >
          設定を読込
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => htmlInputRef.current?.click()}
      >
        HTMLから読込
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleTempSave}>
          一時保存
        </Button>
        {hasSaved && (
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleTempLoad}>
            復元
          </Button>
        )}
      </div>
      {saveMessage && <p className="text-xs text-on-surface-variant text-center">{saveMessage}</p>}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleJsonImport}
      />
      <input
        ref={htmlInputRef}
        type="file"
        accept=".html,.htm"
        className="hidden"
        onChange={handleHtmlImport}
      />
    </div>
  );
}
