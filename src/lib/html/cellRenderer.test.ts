import { describe, it, expect } from "vitest";
import { renderDayCell, renderHolidayMark } from "./cellRenderer";
import type { PageData } from "@/stores/types";
import { THEMES } from "@/lib/themes";

const theme = THEMES[0]; // Classic

function makePage(overrides?: Partial<PageData>): PageData {
  return {
    monthLabel: "2026.04",
    grid: [
      [
        {
          date: "2026-04-01",
          dayOfMonth: 1,
          isCurrentMonth: true,
          isHoliday: false,
          holidayName: null,
          isSunday: false,
          isSaturday: false,
        },
        {
          date: "2026-04-04",
          dayOfMonth: 4,
          isCurrentMonth: true,
          isHoliday: false,
          holidayName: null,
          isSunday: false,
          isSaturday: true,
        },
        {
          date: "2026-04-05",
          dayOfMonth: 5,
          isCurrentMonth: true,
          isHoliday: false,
          holidayName: null,
          isSunday: true,
          isSaturday: false,
        },
        {
          date: "2026-04-29",
          dayOfMonth: 29,
          isCurrentMonth: true,
          isHoliday: true,
          holidayName: "昭和の日",
          isSunday: false,
          isSaturday: false,
        },
        {
          date: null,
          dayOfMonth: null,
          isCurrentMonth: false,
          isHoliday: false,
          holidayName: null,
          isSunday: false,
          isSaturday: false,
        },
      ],
    ],
    weekdayHeaders: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    theme,
    holidayMarkStyle: "dot",
    imageBase64: null,
    imagePercent: 50,
    imagePosition: "top",
    ...overrides,
  };
}

describe("renderHolidayMark", () => {
  it("renders a dot span for dot style", () => {
    const html = renderHolidayMark("dot", "#DC2626");
    expect(html).toContain("border-radius:50%");
    expect(html).toContain("background:#DC2626");
  });

  it("returns empty string for circle style", () => {
    expect(renderHolidayMark("circle", "#DC2626")).toBe("");
  });

  it("returns empty string for underline style", () => {
    expect(renderHolidayMark("underline", "#DC2626")).toBe("");
  });

  it("returns empty string for color-only style", () => {
    expect(renderHolidayMark("color-only", "#DC2626")).toBe("");
  });
});

describe("renderDayCell", () => {
  it("renders empty div for non-current-month cell", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 4, 1);
    expect(html).toBe('<div style="padding:8px 0"></div>');
  });

  it("renders day number for current-month cell", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 0, 1);
    expect(html).toContain(">1</span>");
  });

  it("applies sunday color to sunday cells", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 2, 1);
    expect(html).toContain(`color:${theme.colors.sunday}`);
  });

  it("applies saturday color to saturday cells", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 1, 1);
    expect(html).toContain(`color:${theme.colors.saturday}`);
  });

  it("applies sunday color to holiday cells", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 3, 1);
    expect(html).toContain(`color:${theme.colors.sunday}`);
  });

  it("renders dot mark for holiday with dot style", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 3, 1);
    expect(html).toContain("border-radius:50%");
    expect(html).toContain(`background:${theme.colors.holidayMark}`);
  });

  it("renders circle border for holiday with circle style", () => {
    const page = makePage({ holidayMarkStyle: "circle" });
    const html = renderDayCell(page, 0, 3, 1);
    expect(html).toContain("border-radius:50%");
    expect(html).toContain(`border:1.5px solid ${theme.colors.holidayMark}`);
  });

  it("renders underline for holiday with underline style", () => {
    const page = makePage({ holidayMarkStyle: "underline" });
    const html = renderDayCell(page, 0, 3, 1);
    expect(html).toContain(`border-bottom:2px solid ${theme.colors.holidayMark}`);
  });

  it("renders no extra decoration for color-only style", () => {
    const page = makePage({ holidayMarkStyle: "color-only" });
    const html = renderDayCell(page, 0, 3, 1);
    expect(html).not.toContain("border-radius");
    expect(html).not.toContain("border-bottom:2px");
    expect(html).toContain(`color:${theme.colors.sunday}`);
  });

  it("adds bottom border for non-last rows", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 0, 3);
    expect(html).toContain(`border-bottom:1px solid ${theme.colors.gridRule}`);
  });

  it("omits bottom border for last row", () => {
    const page = makePage();
    const html = renderDayCell(page, 0, 0, 1);
    expect(html).not.toContain("border-bottom:1px solid");
  });
});
