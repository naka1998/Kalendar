import type { CSSProperties } from "react";
import {
  getCalendarTitle,
  getDayCellPadding,
  getDayRules,
  resolveCalendarLayout,
  resolveDayAlignment,
} from "@/lib/calendarLayouts";
import "@/lib/calendarLayouts.css";
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

  const layout = resolveCalendarLayout(calendarStyle.layoutPreset);
  const { dayRuleH, dayRuleV } = getDayRules(calendarStyle);
  const title = getCalendarTitle(layout, monthLabel);
  const dayAlignH = resolveDayAlignment(calendarStyle.dayAlignH);
  const dayAlignV = resolveDayAlignment(calendarStyle.dayAlignV);
  const dayPadding = getDayCellPadding(layout === "date-list" ? 0 : cellPadding, dayAlignV);
  const dayCount = grid.flat().filter((cell) => cell.isCurrentMonth && cell.date).length;
  const gridStyle = {
    width: `${calendarStyle.gridWidth}%`,
    fontFamily: `"${fontFamily}"`,
    fontWeight,
    "--calendar-grid-rule": colors.gridRule,
    "--calendar-list-rows": Math.ceil(dayCount / 2),
    "--calendar-list-short-rows": Math.ceil(dayCount / 3),
  } as CSSProperties;

  return (
    <div
      data-calendar-layout={layout}
      data-day-rule-h={dayRuleH}
      data-day-rule-v={dayRuleV}
      data-day-align-h={dayAlignH}
      data-day-align-v={dayAlignV}
      style={gridStyle}
    >
      {/* Month label */}
      <div
        data-testid="month-title"
        className="calendar-title font-extrabold tracking-tighter"
        style={{
          color: colors.monthLabel,
          fontSize: `${monthFontSize}px`,
          marginBottom: `${headerGap}px`,
        }}
      >
        {layout === "stacked" && title.year && (
          <span className="calendar-title-year">{title.year}</span>
        )}
        {title.main}
        {layout !== "stacked" && title.year && (
          <span className="calendar-title-year">{title.year}</span>
        )}
      </div>

      {/* Header rule */}
      <div
        className="calendar-title-rule"
        style={{
          borderBottom: `1px solid ${colors.headerRule}`,
          marginBottom: `${headerGap}px`,
        }}
      />

      {/* Weekday headers */}
      <div
        className="calendar-weekdays grid grid-cols-7"
        style={{ marginBottom: `${Math.round(headerGap / 2)}px` }}
      >
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
      <div className="calendar-days grid grid-cols-7">
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell.date || !cell.isCurrentMonth) {
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="calendar-cell"
                  data-empty=""
                  style={{ padding: `${cellPadding}px 0` }}
                />
              );
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
                className="calendar-cell flex flex-col items-center"
                data-ruled={ri < grid.length - 1 ? "" : undefined}
                style={{
                  padding: dayPadding,
                }}
              >
                <span
                  className="calendar-day-number flex items-center"
                  data-circled={isCircle ? "" : undefined}
                  style={{
                    color: textColor,
                    fontSize: `${layout === "date-list" ? Math.min(dayFontSize, 14) : dayFontSize}px`,
                    width: layout === "date-list" ? undefined : `${cellSize}px`,
                    height: layout === "date-list" ? undefined : `${cellSize}px`,
                    borderRadius: isCircle ? "50%" : undefined,
                    border: isCircle ? `1.5px solid ${colors.holidayMark}` : undefined,
                    borderBottom: isUnderline ? `2px solid ${colors.holidayMark}` : undefined,
                  }}
                >
                  {cell.dayOfMonth}
                </span>
                {layout === "date-list" && (
                  <span className="calendar-list-weekday" style={{ color: textColor }}>
                    {weekdayHeaders[ci]}
                  </span>
                )}
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
