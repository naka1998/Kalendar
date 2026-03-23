import { describe, it, expect } from "vitest";
import {
  generateMonthRange,
  getMonthGrid,
  formatMonthLabel,
  getWeekdayHeaders,
  enrichDayCells,
} from "./dateUtils";

describe("generateMonthRange", () => {
  it("generates range within same year", () => {
    expect(generateMonthRange("2026-04", "2026-08")).toEqual([
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("generates range across years", () => {
    const range = generateMonthRange("2026-04", "2027-03");
    expect(range).toHaveLength(12);
    expect(range[0]).toBe("2026-04");
    expect(range[11]).toBe("2027-03");
  });

  it("generates single month", () => {
    expect(generateMonthRange("2026-04", "2026-04")).toEqual(["2026-04"]);
  });

  it("generates up to 24 months", () => {
    const range = generateMonthRange("2026-01", "2027-12");
    expect(range).toHaveLength(24);
    expect(range[0]).toBe("2026-01");
    expect(range[23]).toBe("2027-12");
  });

  it("returns empty array for invalid range (end before start)", () => {
    expect(generateMonthRange("2027-03", "2026-04")).toEqual([]);
  });
});

describe("getMonthGrid", () => {
  it("generates correct grid for April 2026 (Sunday start)", () => {
    // April 2026: 1st is Wednesday
    const grid = getMonthGrid("2026-04", "sunday");
    expect(grid.length).toBeGreaterThanOrEqual(5);
    expect(grid[0]).toHaveLength(7);

    // First row: Sun-Tue should be null, Wed should be 1
    expect(grid[0][0].dayOfMonth).toBeNull(); // Sun
    expect(grid[0][1].dayOfMonth).toBeNull(); // Mon
    expect(grid[0][2].dayOfMonth).toBeNull(); // Tue
    expect(grid[0][3].dayOfMonth).toBe(1); // Wed
  });

  it("generates correct grid for April 2026 (Monday start)", () => {
    const grid = getMonthGrid("2026-04", "monday");
    // Monday start: 1st is Wednesday → Mon, Tue are null, Wed is 1
    expect(grid[0][0].dayOfMonth).toBeNull(); // Mon
    expect(grid[0][1].dayOfMonth).toBeNull(); // Tue
    expect(grid[0][2].dayOfMonth).toBe(1); // Wed
  });

  it("handles February with 28 days", () => {
    const grid = getMonthGrid("2026-02", "sunday");
    const allDays = grid.flat().filter((c) => c.isCurrentMonth);
    expect(allDays).toHaveLength(28);
  });

  it("handles leap year February (2028)", () => {
    const grid = getMonthGrid("2028-02", "sunday");
    const allDays = grid.flat().filter((c) => c.isCurrentMonth);
    expect(allDays).toHaveLength(29);
  });

  it("handles months with 31 days", () => {
    const grid = getMonthGrid("2026-01", "sunday");
    const allDays = grid.flat().filter((c) => c.isCurrentMonth);
    expect(allDays).toHaveLength(31);
  });

  it("generates 6 rows when needed", () => {
    // August 2026: 1st is Saturday (Sunday start) → needs 6 rows
    const grid = getMonthGrid("2026-08", "sunday");
    expect(grid).toHaveLength(6);
  });

  it("sets isSunday and isSaturday correctly", () => {
    const grid = getMonthGrid("2026-04", "sunday");
    // In Sunday-start grid, col 0 = Sunday, col 6 = Saturday
    const firstDay = grid[0][3]; // Wed Apr 1
    expect(firstDay.isSunday).toBe(false);
    expect(firstDay.isSaturday).toBe(false);

    // Find a Sunday (Apr 5 = col 0 of row 1)
    const sunday = grid[1][0];
    expect(sunday.isSunday).toBe(true);
    expect(sunday.dayOfMonth).toBe(5);

    // Find a Saturday (Apr 4 = col 6 of row 0)
    const saturday = grid[0][6];
    expect(saturday.isSaturday).toBe(true);
    expect(saturday.dayOfMonth).toBe(4);
  });

  it("sets correct date strings", () => {
    const grid = getMonthGrid("2026-04", "sunday");
    const apr1 = grid[0][3];
    expect(apr1.date).toBe("2026-04-01");
  });
});

describe("formatMonthLabel", () => {
  it("formats as yyyy.mm", () => {
    expect(formatMonthLabel("2026-04", "yyyy.mm")).toBe("2026.04");
  });

  it("formats as month-yyyy (English)", () => {
    expect(formatMonthLabel("2026-04", "month-yyyy")).toBe("April 2026");
    expect(formatMonthLabel("2026-12", "month-yyyy")).toBe("December 2026");
  });

  it("formats as Japanese", () => {
    expect(formatMonthLabel("2026-04", "ja")).toBe("2026年4月");
    expect(formatMonthLabel("2026-12", "ja")).toBe("2026年12月");
  });
});

describe("getWeekdayHeaders", () => {
  it("returns Japanese headers (Sunday start)", () => {
    expect(getWeekdayHeaders("ja", "sunday")).toEqual(["日", "月", "火", "水", "木", "金", "土"]);
  });

  it("returns Japanese headers (Monday start)", () => {
    expect(getWeekdayHeaders("ja", "monday")).toEqual(["月", "火", "水", "木", "金", "土", "日"]);
  });

  it("returns English short headers (Sunday start)", () => {
    expect(getWeekdayHeaders("en-short", "sunday")).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  it("returns English short headers (Monday start)", () => {
    expect(getWeekdayHeaders("en-short", "monday")).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("returns English full headers", () => {
    expect(getWeekdayHeaders("en-full", "sunday")).toEqual([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
  });
});

describe("enrichDayCells", () => {
  it("marks holidays on matching dates", () => {
    const grid = getMonthGrid("2026-01", "sunday");
    const holidays = { "2026-01-01": "元日" };
    const enriched = enrichDayCells(grid, holidays);

    const jan1 = enriched.flat().find((c) => c.date === "2026-01-01");
    expect(jan1?.isHoliday).toBe(true);
    expect(jan1?.holidayName).toBe("元日");
  });

  it("does not mark non-holiday dates", () => {
    const grid = getMonthGrid("2026-01", "sunday");
    const holidays = { "2026-01-01": "元日" };
    const enriched = enrichDayCells(grid, holidays);

    const jan2 = enriched.flat().find((c) => c.date === "2026-01-02");
    expect(jan2?.isHoliday).toBe(false);
    expect(jan2?.holidayName).toBeNull();
  });

  it("handles empty holidays", () => {
    const grid = getMonthGrid("2026-01", "sunday");
    const enriched = enrichDayCells(grid, {});
    const anyHoliday = enriched.flat().some((c) => c.isHoliday);
    expect(anyHoliday).toBe(false);
  });
});
