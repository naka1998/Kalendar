import type { ColorTheme, DayCell, FontWeight, HolidayMarkStyle } from "@/stores/types";

export interface CalendarGridProps {
  grid: DayCell[][];
  weekdayHeaders: string[];
  monthLabel: string;
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  fontFamily: string;
  fontWeight: FontWeight;
}

function HolidayMark({ style, color }: { style: HolidayMarkStyle; color: string }) {
  switch (style) {
    case "dot":
      return (
        <span className="block text-center text-[10px] leading-none" style={{ color }}>
          ·
        </span>
      );
    case "circle":
      return null; // Handled by cell border-radius
    case "underline":
      return null; // Handled by cell border-bottom
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
}: CalendarGridProps) {
  const { colors } = theme;

  return (
    <div style={{ fontFamily, fontWeight }}>
      {/* Month label */}
      <div
        className="mb-3 font-heading text-5xl font-extrabold tracking-tighter"
        style={{ color: colors.monthLabel }}
      >
        {monthLabel}
      </div>

      {/* Header rule */}
      <div className="mb-2" style={{ borderBottom: `1px solid ${colors.headerRule}` }} />

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7">
        {weekdayHeaders.map((header, i) => (
          <div
            key={i}
            className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: colors.weekdayHeader }}
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
              return <div key={`${ri}-${ci}`} className="py-2" />;
            }

            let textColor = colors.text;
            if (cell.isHoliday || cell.isSunday) textColor = colors.sunday;
            else if (cell.isSaturday) textColor = colors.saturday;

            const isCircle = cell.isHoliday && holidayMarkStyle === "circle";
            const isUnderline = cell.isHoliday && holidayMarkStyle === "underline";

            return (
              <div
                key={`${ri}-${ci}`}
                className="flex flex-col items-center py-2"
                style={{
                  borderBottom: ri < grid.length - 1 ? `1px solid ${colors.gridRule}` : undefined,
                }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center text-sm"
                  style={{
                    color: textColor,
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
