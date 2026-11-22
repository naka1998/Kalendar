import { describe, it, expect } from "vitest";
import { renderGridHtml } from "./gridRenderer";
import type { PageData } from "@/stores/types";
import { THEMES } from "@/lib/themes";

const theme = THEMES[0];

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

describe("renderGridHtml", () => {
  it("exports saved rule-only layouts as the standard grid with matching rules", () => {
    const full = renderGridHtml(makePage(), 100, { layoutPreset: "full-grid" });
    const unruled = renderGridHtml(makePage(), 100, { layoutPreset: "unruled" });
    expect(full).toContain(
      'data-calendar-layout="standard" data-day-rule-h="true" data-day-rule-v="true"',
    );
    expect(unruled).toContain(
      'data-calendar-layout="standard" data-day-rule-h="false" data-day-rule-v="false"',
    );
  });

  it("renders month label", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain("2026.04");
  });

  it("escapes HTML in month label", () => {
    const html = renderGridHtml(makePage({ monthLabel: "<script>alert(1)</script>" }));
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("applies month label color from theme", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain(`color:${theme.colors.monthLabel}`);
  });

  it("renders header rule with theme color", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain(`border-bottom:1px solid ${theme.colors.headerRule}`);
  });

  it("renders 7 weekday headers", () => {
    const html = renderGridHtml(makePage());
    for (const header of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
      expect(html).toContain(header);
    }
  });

  it("applies weekday header color from theme", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain(`color:${theme.colors.weekdayHeader}`);
  });

  it("renders the day grid", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain('<div class="calendar-days">');
  });

  it("renders day cells via renderDayCell", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain(">1</span>");
  });

  it("uses default monthFontSize (48px) from constants when no style override", () => {
    const html = renderGridHtml(makePage());
    expect(html).toContain("font-size:48px");
  });

  it("uses default weekdayFontSize (12px) from constants when no style override", () => {
    const html = renderGridHtml(makePage());
    // weekday header should use 12px, not hardcoded 10px
    expect(html).not.toContain("font-size:10px");
  });

  it("applies custom monthFontSize", () => {
    const html = renderGridHtml(makePage(), 100, { monthFontSize: 36 });
    expect(html).toContain("font-size:36px");
  });

  it("applies custom weekdayFontSize", () => {
    const html = renderGridHtml(makePage(), 100, { weekdayFontSize: 16 });
    expect(html).toContain("font-size:16px");
  });

  it("applies custom headerGap", () => {
    const html = renderGridHtml(makePage(), 100, { headerGap: 16 });
    expect(html).toContain("margin-bottom:16px");
  });
});
