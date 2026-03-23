import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MonthLabelFormat, Orientation, WeekStart, WeekdayFormat } from "@/stores/types";

function MonthSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearChange = (y: string | null) => {
    if (y) onChange(`${y}-${monthStr}`);
  };

  const handleMonthChange = (m: string | null) => {
    if (m) onChange(`${yearStr}-${m.padStart(2, "0")}`);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        {label}
      </Label>
      <div className="flex gap-2">
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="flex-1 border-none bg-surface-container-high text-sm focus:bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(month)} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-20 border-none bg-surface-container-high text-sm focus:bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m}月
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
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
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
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

export function BasicSection() {
  const store = useCalendarStore();

  return (
    <div className="space-y-4">
      <MonthSelect label="Start Date" value={store.startMonth} onChange={store.setStartMonth} />

      <MonthSelect label="End Date" value={store.endMonth} onChange={store.setEndMonth} />

      <SegmentedControl<Orientation>
        label="Paper"
        options={[
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ]}
        value={store.orientation}
        onChange={store.setOrientation}
      />

      <SegmentedControl<WeekStart>
        label="Week Start"
        options={[
          { value: "sunday", label: "Sun" },
          { value: "monday", label: "Mon" },
        ]}
        value={store.weekStart}
        onChange={store.setWeekStart}
      />

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Day Label Format
        </Label>
        <Select
          value={store.weekdayFormat}
          onValueChange={(v) => {
            if (v) store.setWeekdayFormat(v as WeekdayFormat);
          }}
        >
          <SelectTrigger className="border-none bg-surface-container-high text-sm focus:bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-short">Sun Mon Tue...</SelectItem>
            <SelectItem value="en-full">Sunday Monday...</SelectItem>
            <SelectItem value="ja">日 月 火...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          Month Label Format
        </Label>
        <Select
          value={store.monthLabelFormat}
          onValueChange={(v) => {
            if (v) store.setMonthLabelFormat(v as MonthLabelFormat);
          }}
        >
          <SelectTrigger className="border-none bg-surface-container-high text-sm focus:bg-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yyyy.mm">2026.04</SelectItem>
            <SelectItem value="month-yyyy">April 2026</SelectItem>
            <SelectItem value="ja">2026年4月</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
