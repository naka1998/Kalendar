import type {
  CalendarStyle,
  ColorTheme,
  DayCell,
  FontWeight,
  HolidayMarkStyle,
} from "@/stores/types";

export interface CalendarGridProps {
  grid: DayCell[][];
  weekdayHeaders: string[];
  monthLabel: string;
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  fontFamily: string;
  fontWeight: FontWeight;
  calendarStyle: CalendarStyle;
}

function HolidayMark({ style, color }: { style: HolidayMarkStyle; color: string }) {
  switch (style) {
    case "dot":
      return (
        <span
          className="mt-0.5 block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      );
    case "circle":
      return null;
    case "underline":
      return null;
    case "color-only":
      return null;
  }
}

export function CalendarGrid({
  grid,
  weekdayHeaders,
  monthLabel,
  theme,
  holidayMarkStyle,
  fontFamily,
  fontWeight,
  calendarStyle,
}: CalendarGridProps) {
  const { colors } = theme;
  const { monthFontSize, dayFontSize, weekdayFontSize, cellPadding, headerGap } = calendarStyle;

  return (
    <div className="w-full" style={{ fontFamily, fontWeight }}>
      {/* Month label */}
      <div
        className="font-heading font-extrabold tracking-tighter"
        style={{
          color: colors.monthLabel,
          fontSize: `${monthFontSize}px`,
          marginBottom: `${headerGap}px`,
        }}
      >
        {monthLabel}
      </div>

      {/* Header rule */}
      <div
        style={{
          borderBottom: `1px solid ${colors.headerRule}`,
          marginBottom: `${headerGap}px`,
        }}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7" style={{ marginBottom: `${Math.round(headerGap / 2)}px` }}>
        {weekdayHeaders.map((header, i) => (
          <div
            key={i}
            className="text-center font-bold uppercase tracking-[0.2em]"
            style={{
              color: colors.weekdayHeader,
              fontSize: `${weekdayFontSize}px`,
              padding: `${Math.round(cellPadding / 2)}px 0`,
            }}
          >
            {header}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell.date || !cell.isCurrentMonth) {
              return <div key={`${ri}-${ci}`} style={{ padding: `${cellPadding}px 0` }} />;
            }

            let textColor = colors.text;
            if (cell.isHoliday || cell.isSunday) textColor = colors.sunday;
            else if (cell.isSaturday) textColor = colors.saturday;

            const isCircle = cell.isHoliday && holidayMarkStyle === "circle";
            const isUnderline = cell.isHoliday && holidayMarkStyle === "underline";
            const cellSize = Math.max(dayFontSize + 12, 28);

            return (
              <div
                key={`${ri}-${ci}`}
                className="flex flex-col items-center"
                style={{
                  padding: `${cellPadding}px 0`,
                  borderBottom: ri < grid.length - 1 ? `1px solid ${colors.gridRule}` : undefined,
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    color: textColor,
                    fontSize: `${dayFontSize}px`,
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    borderRadius: isCircle ? "50%" : undefined,
                    border: isCircle ? `1.5px solid ${colors.holidayMark}` : undefined,
                    borderBottom: isUnderline ? `2px solid ${colors.holidayMark}` : undefined,
                  }}
                >
                  {cell.dayOfMonth}
                </span>
                {cell.isHoliday && holidayMarkStyle === "dot" && (
                  <HolidayMark style="dot" color={colors.holidayMark} />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
