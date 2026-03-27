import { useCalendarStore } from "@/stores/calendarStore";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HolidayMarkStyle,
  MonthLabelFormat,
  Orientation,
  WeekStart,
  WeekdayFormat,
} from "@/stores/types";

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
      <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
        {label}
      </Label>
      <div className="flex gap-2">
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger
            aria-label={`${label} 年`}
            className="flex-1 border-none bg-surface-container-high text-sm focus:bg-surface"
          >
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
          <SelectTrigger
            aria-label={`${label} 月`}
            className="w-20 border-none bg-surface-container-high text-sm focus:bg-surface"
          >
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
      <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
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
      <MonthSelect label="開始月" value={store.startMonth} onChange={store.setStartMonth} />

      <MonthSelect label="終了月" value={store.endMonth} onChange={store.setEndMonth} />

      <SegmentedControl<Orientation>
        label="用紙"
        options={[
          { value: "portrait", label: "縦" },
          { value: "landscape", label: "横" },
        ]}
        value={store.orientation}
        onChange={store.setOrientation}
      />

      <SegmentedControl<WeekStart>
        label="週の開始"
        options={[
          { value: "sunday", label: "日曜" },
          { value: "monday", label: "月曜" },
        ]}
        value={store.weekStart}
        onChange={store.setWeekStart}
      />

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          曜日表記
        </Label>
        <Select
          value={store.weekdayFormat}
          onValueChange={(v) => {
            if (v) store.setWeekdayFormat(v as WeekdayFormat);
          }}
        >
          <SelectTrigger
            aria-label="曜日表記"
            className="border-none bg-surface-container-high text-sm focus:bg-surface"
          >
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
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          月表記
        </Label>
        <Select
          value={store.monthLabelFormat}
          onValueChange={(v) => {
            if (v) store.setMonthLabelFormat(v as MonthLabelFormat);
          }}
        >
          <SelectTrigger
            aria-label="月表記"
            className="border-none bg-surface-container-high text-sm focus:bg-surface"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yyyy.mm">2026.04</SelectItem>
            <SelectItem value="month-yyyy">April 2026</SelectItem>
            <SelectItem value="ja">2026年4月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Holiday mark style */}
      <SegmentedControl<HolidayMarkStyle>
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

      {/* Image toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
          画像を使用
        </Label>
        <button
          aria-label="画像を使用"
          onClick={() => store.setUseImages(!store.useImages)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            store.useImages ? "bg-primary" : "bg-surface-container-highest"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              store.useImages ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
