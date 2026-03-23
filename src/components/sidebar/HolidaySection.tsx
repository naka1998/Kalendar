import { useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { HolidayMarkStyle } from "@/stores/types";

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: HolidayMarkStyle; label: string }[];
  value: HolidayMarkStyle;
  onChange: (v: HolidayMarkStyle) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        {label}
      </Label>
      <div className="flex rounded-lg bg-surface-container-high p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
              value === opt.value
                ? "bg-surface text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HolidaySection() {
  const store = useCalendarStore();
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");

  const handleAddHoliday = () => {
    if (newDate && newName) {
      store.addManualHoliday(newDate, newName);
      setNewDate("");
      setNewName("");
    }
  };

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
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          取得状態
        </span>
        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
      </div>

      <SegmentedControl
        label="祝日マーク"
        options={[
          { value: "dot", label: "ドット" },
          { value: "circle", label: "丸囲み" },
          { value: "underline", label: "下線" },
          { value: "color-only", label: "色のみ" },
        ]}
        value={store.holidayMarkStyle}
        onChange={store.setHolidayMarkStyle}
      />

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
    </div>
  );
}
