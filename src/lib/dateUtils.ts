import type { DayCell, MonthLabelFormat, WeekStart, WeekdayFormat } from "@/stores/types";

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_EN_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseYearMonth(yearMonth: string): { year: number; month: number } {
  const [y, m] = yearMonth.split("-").map(Number);
  return { year: y, month: m };
}

function padMonth(month: number): string {
  return month.toString().padStart(2, "0");
}

function padDay(day: number): string {
  return day.toString().padStart(2, "0");
}

export function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const start = parseYearMonth(startMonth);
  const end = parseYearMonth(endMonth);

  const startVal = start.year * 12 + start.month;
  const endVal = end.year * 12 + end.month;

  if (endVal < startVal) return [];

  const result: string[] = [];
  let year = start.year;
  let month = start.month;

  while (year * 12 + month <= endVal) {
    result.push(`${year}-${padMonth(month)}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return result;
}

export function getMonthGrid(yearMonth: string, weekStart: WeekStart): DayCell[][] {
  const { year, month } = parseYearMonth(yearMonth);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  const offset = weekStart === "monday" ? (firstDayOfWeek + 6) % 7 : firstDayOfWeek;

  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const rows: DayCell[][] = [];

  for (let i = 0; i < totalCells; i++) {
    if (i % 7 === 0) rows.push([]);
    const dayNum = i - offset + 1;
    const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;

    if (isInMonth) {
      const dateObj = new Date(year, month - 1, dayNum);
      const dow = dateObj.getDay();
      rows[rows.length - 1].push({
        date: `${year}-${padMonth(month)}-${padDay(dayNum)}`,
        dayOfMonth: dayNum,
        isCurrentMonth: true,
        isHoliday: false,
        holidayName: null,
        isSunday: dow === 0,
        isSaturday: dow === 6,
      });
    } else {
      rows[rows.length - 1].push({
        date: null,
        dayOfMonth: null,
        isCurrentMonth: false,
        isHoliday: false,
        holidayName: null,
        isSunday: false,
        isSaturday: false,
      });
    }
  }

  return rows;
}

export function formatMonthLabel(yearMonth: string, format: MonthLabelFormat): string {
  const { year, month } = parseYearMonth(yearMonth);

  switch (format) {
    case "yyyy.mm":
      return `${year}.${padMonth(month)}`;
    case "month-yyyy":
      return `${MONTH_NAMES_EN[month - 1]} ${year}`;
    case "ja":
      return `${year}年${month}月`;
  }
}

export function getWeekdayHeaders(format: WeekdayFormat, weekStart: WeekStart): string[] {
  let days: string[];
  switch (format) {
    case "ja":
      days = [...WEEKDAYS_JA];
      break;
    case "en-short":
      days = [...WEEKDAYS_EN_SHORT];
      break;
    case "en-full":
      days = [...WEEKDAYS_EN_FULL];
      break;
  }

  if (weekStart === "monday") {
    const sunday = days.shift()!;
    days.push(sunday);
  }

  return days;
}

export function enrichDayCells(grid: DayCell[][], holidays: Record<string, string>): DayCell[][] {
  return grid.map((row) =>
    row.map((cell) => {
      if (!cell.date || !cell.isCurrentMonth) return cell;
      const holidayName = holidays[cell.date] ?? null;
      return {
        ...cell,
        isHoliday: holidayName !== null,
        holidayName,
      };
    }),
  );
}
