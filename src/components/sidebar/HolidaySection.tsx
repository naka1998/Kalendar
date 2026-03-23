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
      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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

  // Fetch status
  const statusText = store.holidaysFetchError
    ? "Error"
    : store.holidaysFetched
      ? "Loaded"
      : "Loading...";
  const statusColor = store.holidaysFetchError
    ? "text-sunday"
    : store.holidaysFetched
      ? "text-primary"
      : "text-on-surface-variant";

  return (
    <div className="space-y-4">
      {/* Fetch status */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          API Status
        </span>
        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
      </div>

      {/* Mark style */}
      <SegmentedControl
        label="Holiday Mark"
        options={[
          { value: "dot", label: "Dot" },
          { value: "circle", label: "Circle" },
          { value: "underline", label: "Line" },
          { value: "color-only", label: "Color" },
        ]}
        value={store.holidayMarkStyle}
        onChange={store.setHolidayMarkStyle}
      />

      {/* Manual holiday add */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Add Holiday
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
            placeholder="Name"
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
          Add
        </Button>
      </div>

      {/* Manual holidays list */}
      {store.manualHolidays.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            Custom Holidays
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

      {/* Removed API holidays */}
      {store.removedHolidays.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            Hidden Holidays
          </Label>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {store.removedHolidays.map((date) => (
              <div
                key={date}
                className="flex items-center justify-between rounded-md bg-surface-container-high px-2 py-1"
              >
                <span className="text-xs text-on-surface">
                  {date} — {store.apiHolidays[date] ?? "Unknown"}
                </span>
                <button
                  onClick={() => store.restoreApiHoliday(date)}
                  className="text-xs text-primary hover:underline"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
