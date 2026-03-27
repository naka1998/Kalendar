import { useState, useCallback, useRef } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { importFromHtmlFile } from "@/lib/htmlImporter";
import { clearStorage } from "@/lib/storageService";

export function DataSection() {
  const store = useCalendarStore();
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const htmlInputRef = useRef<HTMLInputElement>(null);

  const handleAddHoliday = () => {
    if (newDate && newName) {
      store.addManualHoliday(newDate, newName);
      setNewDate("");
      setNewName("");
    }
  };

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

  const statusText = store.holidaysFetchError
    ? "エラー"
    : store.holidaysFetched
      ? "取得済み"
      : "取得中...";
  const statusColor = store.holidaysFetchError
    ? "text-sunday"
    : store.holidaysFetched
      ? "text-primary"
      : "text-on-surface-variant";

  return (
    <div className="space-y-4">
      {/* Holiday fetch status */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          取得状態
        </span>
        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
      </div>

      {/* Add holiday */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          祝日を追加
        </Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="flex-1 border-none bg-surface-container-high text-sm focus:bg-surface"
          />
          <Input
            type="text"
            placeholder="名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border-none bg-surface-container-high text-sm focus:bg-surface"
          />
        </div>
        <Button
          onClick={handleAddHoliday}
          disabled={!newDate || !newName}
          variant="outline"
          size="sm"
          className="w-full"
        >
          追加
        </Button>
      </div>

      {store.manualHolidays.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            手動追加した祝日
          </Label>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {store.manualHolidays.map((h) => (
              <div
                key={h.date}
                className="flex items-center justify-between rounded-md bg-surface-container-high px-2 py-1"
              >
                <span className="text-xs text-on-surface">
                  {h.date} — {h.name}
                </span>
                <button
                  onClick={() => store.removeManualHoliday(h.date)}
                  className="text-xs text-on-surface-variant hover:text-sunday"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {store.removedHolidays.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            非表示の祝日
          </Label>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {store.removedHolidays.map((date) => (
              <div
                key={date}
                className="flex items-center justify-between rounded-md bg-surface-container-high px-2 py-1"
              >
                <span className="text-xs text-on-surface">
                  {date} — {store.apiHolidays[date] ?? "不明"}
                </span>
                <button
                  onClick={() => store.restoreApiHoliday(date)}
                  className="text-xs text-primary hover:underline"
                >
                  復元
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HTML import & Reset */}
      <div className="space-y-2 border-t border-outline-variant/30 pt-4">
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
    </div>
  );
}
