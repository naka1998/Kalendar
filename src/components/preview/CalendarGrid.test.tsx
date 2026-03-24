import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";
import { getMonthGrid, getWeekdayHeaders, enrichDayCells } from "@/lib/dateUtils";
import { THEMES } from "@/lib/themes";
import { DEFAULT_CALENDAR_STYLE } from "@/lib/constants";

const theme = THEMES[0]; // Classic

function renderGrid(overrides?: Partial<Parameters<typeof CalendarGrid>[0]>) {
  const grid = enrichDayCells(getMonthGrid("2026-04", "sunday"), {});
  const defaults = {
    grid,
    weekdayHeaders: getWeekdayHeaders("en-short", "sunday"),
    monthLabel: "2026.04",
    theme,
    holidayMarkStyle: "dot" as const,
    fontFamily: "Montserrat",
    fontWeight: 400 as const,
    calendarStyle: { ...DEFAULT_CALENDAR_STYLE },
  };
  return render(<CalendarGrid {...defaults} {...overrides} />);
}

describe("CalendarGrid", () => {
  it("renders month label", () => {
    renderGrid();
    expect(screen.getByText("2026.04")).toBeDefined();
  });

  it("renders 7 weekday headers", () => {
    renderGrid();
    expect(screen.getByText("Sun")).toBeDefined();
    expect(screen.getByText("Mon")).toBeDefined();
    expect(screen.getByText("Sat")).toBeDefined();
  });

  it("renders day numbers", () => {
    renderGrid();
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();
  });

  it("applies sunday color to sundays", () => {
    renderGrid();
    // April 5, 2026 is Sunday — jsdom converts hex to rgb
    const el = screen.getByText("5");
    expect(el.style.color).toBe("rgb(220, 38, 38)");
  });

  it("applies saturday color to saturdays", () => {
    renderGrid();
    // April 4, 2026 is Saturday
    const el = screen.getByText("4");
    expect(el.style.color).toBe("rgb(37, 99, 235)");
  });

  it("renders dot mark for holidays", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    renderGrid({ grid, monthLabel: "2026.01" });
    // Should have a dot marker (rendered as a small circle span)
    const dots = document.querySelectorAll('[class*="rounded-full"]');
    expect(dots.length).toBeGreaterThan(0);
  });

  it("renders circle mark for holidays", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    renderGrid({ grid, monthLabel: "2026.01", holidayMarkStyle: "circle" });
    const el = screen.getByText("1");
    expect(el.style.borderRadius).toBe("50%");
  });

  it("renders underline mark for holidays", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    renderGrid({ grid, monthLabel: "2026.01", holidayMarkStyle: "underline" });
    const el = screen.getByText("1");
    expect(el.style.borderBottom).toContain("2px solid");
  });

  it("renders color-only style without extra decoration", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    renderGrid({ grid, monthLabel: "2026.01", holidayMarkStyle: "color-only" });
    const el = screen.getByText("1");
    // Should have holiday color (sunday color) but no border-radius or underline
    expect(el.style.color).toBe("rgb(220, 38, 38)");
    expect(el.style.borderRadius).toBe("");
    expect(el.style.borderBottom).toBe("");
    // No dot marker should exist
    const dots = document.querySelectorAll('[class*="rounded-full"]');
    expect(dots.length).toBe(0);
  });
});
