import { describe, it, expect } from "vitest";
import { generateSingleHtml, generateExternalHtml } from "./htmlGenerator";
import type { HtmlGeneratorInput, PageData } from "@/stores/types";
import { THEMES } from "./themes";
import { getMonthGrid, getWeekdayHeaders, formatMonthLabel, enrichDayCells } from "./dateUtils";

function createTestInput(overrides?: Partial<PageData>): HtmlGeneratorInput {
  const grid = enrichDayCells(getMonthGrid("2026-04", "sunday"), {});
  const page: PageData = {
    monthLabel: formatMonthLabel("2026-04", "yyyy.mm"),
    grid,
    weekdayHeaders: getWeekdayHeaders("en-short", "sunday"),
    theme: THEMES[0],
    holidayMarkStyle: "dot",
    imageBase64: null,
    imagePercent: 50,
    imagePosition: "top" as const,
    ...overrides,
  };
  return {
    pages: [page],
    orientation: "portrait",
    fontFamily: "Montserrat",
    fontWeight: 400,
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap",
  };
}

describe("generateSingleHtml", () => {
  it("generates valid HTML document", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("<head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</html>");
  });

  it("includes @page CSS with correct size", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("@page { size: A4 portrait; margin: 0; }");
  });

  it("includes landscape @page when orientation is landscape", () => {
    const input = createTestInput();
    input.orientation = "landscape";
    const html = generateSingleHtml(input);
    expect(html).toContain("@page { size: A4 landscape; margin: 0; }");
  });

  it("includes print-color-adjust", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("print-color-adjust: exact");
    expect(html).toContain("-webkit-print-color-adjust: exact");
  });

  it("includes Google Fonts link", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("fonts.googleapis.com");
    expect(html).toContain("Montserrat");
  });

  it("includes page-break-after for pages", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("page-break-after:always");
  });

  it("includes month label", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("2026.04");
  });

  it("includes weekday headers", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain("Sun");
    expect(html).toContain("Mon");
    expect(html).toContain("Sat");
  });

  it("applies theme colors as inline styles", () => {
    const html = generateSingleHtml(createTestInput());
    expect(html).toContain(THEMES[0].colors.background);
    expect(html).toContain(THEMES[0].colors.monthLabel);
  });

  it("embeds base64 image when provided", () => {
    const html = generateSingleHtml(
      createTestInput({ imageBase64: "data:image/jpeg;base64,abc123" }),
    );
    expect(html).toContain("data:image/jpeg;base64,abc123");
    expect(html).toContain("object-fit:contain");
  });

  it("generates multiple pages", () => {
    const input = createTestInput();
    const page2: PageData = {
      ...input.pages[0],
      monthLabel: "2026.05",
      grid: enrichDayCells(getMonthGrid("2026-05", "sunday"), {}),
    };
    input.pages.push(page2);
    const html = generateSingleHtml(input);
    expect(html).toContain("2026.04");
    expect(html).toContain("2026.05");
  });

  it("renders dot holiday marks", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    const html = generateSingleHtml(
      createTestInput({ grid, monthLabel: "2026.01", holidayMarkStyle: "dot" }),
    );
    expect(html).toContain("border-radius:50%");
    expect(html).toContain("width:6px;height:6px");
  });

  it("renders image area with custom percent", () => {
    const html = generateSingleHtml(
      createTestInput({ imageBase64: "data:image/jpeg;base64,abc123", imagePercent: 65 }),
    );
    expect(html).toContain("height:65%");
    expect(html).toContain("height:35%");
  });

  it("renders bottom layout with grid before image", () => {
    const html = generateSingleHtml(
      createTestInput({
        imageBase64: "data:image/jpeg;base64,abc123",
        imagePosition: "bottom",
      }),
    );
    // In bottom layout, grid HTML should appear before image HTML
    const gridIndex = html.indexOf("grid-template-columns:repeat(7");
    const imgIndex = html.indexOf("object-fit:contain");
    expect(gridIndex).toBeLessThan(imgIndex);
  });

  it("renders horizontal layout with flex-direction row", () => {
    const html = generateSingleHtml(
      createTestInput({
        imageBase64: "data:image/jpeg;base64,abc123",
        imagePosition: "left",
      }),
    );
    expect(html).toContain("display:flex");
    expect(html).toContain("width:50%");
  });

  it("renders right layout with grid before image", () => {
    const html = generateSingleHtml(
      createTestInput({
        imageBase64: "data:image/jpeg;base64,abc123",
        imagePosition: "right",
      }),
    );
    const gridIndex = html.indexOf("grid-template-columns:repeat(7");
    const imgIndex = html.indexOf("object-fit:contain");
    expect(gridIndex).toBeLessThan(imgIndex);
  });

  it("applies justify-content center for center align in grid container", () => {
    const input = createTestInput({
      imageBase64: "data:image/jpeg;base64,abc123",
      imagePosition: "left",
    });
    input.calendarStyle = { contentAlignV: "center" };
    const html = generateSingleHtml(input);
    expect(html).toContain("justify-content:center");
  });

  it("applies justify-content flex-start for start align", () => {
    const input = createTestInput({
      imageBase64: "data:image/jpeg;base64,abc123",
      imagePosition: "left",
    });
    input.calendarStyle = { contentAlignV: "start" };
    const html = generateSingleHtml(input);
    expect(html).toContain("justify-content:flex-start");
  });

  it("applies page margin top", () => {
    const input = createTestInput();
    input.calendarStyle = { pageMarginTop: 40 };
    const html = generateSingleHtml(input);
    expect(html).toContain("padding-top:40px");
  });

  it("renders circle holiday marks", () => {
    const grid = enrichDayCells(getMonthGrid("2026-01", "sunday"), {
      "2026-01-01": "元日",
    });
    const html = generateSingleHtml(
      createTestInput({ grid, monthLabel: "2026.01", holidayMarkStyle: "circle" }),
    );
    expect(html).toContain("border-radius:50%");
  });
});

describe("generateExternalHtml", () => {
  it("replaces base64 images with external file paths", () => {
    const input = createTestInput({
      imageBase64: "data:image/jpeg;base64,abc123",
    });
    const html = generateExternalHtml(input, "images");
    expect(html).toContain("images/00.jpg");
    expect(html).not.toContain("data:image/jpeg;base64,abc123");
  });

  it("uses png extension for PNG images", () => {
    const input = createTestInput({
      imageBase64: "data:image/png;base64,abc123",
    });
    const html = generateExternalHtml(input, "img");
    expect(html).toContain("img/00.png");
  });

  it("preserves pages without images", () => {
    const input = createTestInput({ imageBase64: null });
    const html = generateExternalHtml(input, "images");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).not.toContain("images/");
  });
});
