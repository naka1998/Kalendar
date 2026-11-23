import { useId } from "react";
import { Label } from "@/components/ui/label";
import { useCalendarStore } from "@/stores/calendarStore";
import type { HolidayMarkStyle } from "@/stores/types";

const options = [
  { value: "dot", label: "ドット" },
  { value: "circle", label: "丸囲み" },
  { value: "underline", label: "下線" },
  { value: "color-only", label: "色のみ" },
  { value: "name", label: "祝日名" },
] as const satisfies readonly { value: HolidayMarkStyle; label: string }[];

export function HolidayMarkSelect() {
  const id = useId();
  const value = useCalendarStore((s) => s.holidayMarkStyle);
  const setValue = useCalendarStore((s) => s.setHolidayMarkStyle);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold tracking-[0.3em] text-on-surface-variant">
        祝日マーク
      </Label>
      <select
        id={id}
        className="h-9 w-full rounded-md bg-surface-container-high px-2.5 text-sm focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => {
          const selected = options.find((option) => option.value === event.target.value);
          if (selected) setValue(selected.value);
        }}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
