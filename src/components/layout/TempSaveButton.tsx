import { useCallback, useEffect, useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { saveToStorage, loadFromStorage, hasSavedData } from "@/lib/storageService";

export function TempSaveButton() {
  const [hasSaved, setHasSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasSaved(hasSavedData());
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = useCallback(() => {
    const state = useCalendarStore.getState();
    const result = saveToStorage(state);
    if (result.success) {
      setHasSaved(true);
      showMessage("保存しました");
    } else {
      showMessage(result.error ?? "保存に失敗しました");
    }
  }, []);

  const handleLoad = useCallback(() => {
    if (!window.confirm("保存済みデータで現在の設定を上書きしますか？")) return;

    const loaded = loadFromStorage();
    if (loaded) {
      useCalendarStore.setState(loaded);
    }
  }, []);

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        onClick={handleSave}
        className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high"
      >
        一時保存
      </button>
      {hasSaved && (
        <button
          onClick={handleLoad}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high"
        >
          復元
        </button>
      )}
      {message && (
        <span className="absolute -bottom-6 left-0 whitespace-nowrap text-xs text-on-surface-variant">
          {message}
        </span>
      )}
    </div>
  );
}
