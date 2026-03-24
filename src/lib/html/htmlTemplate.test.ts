import { describe, it, expect } from "vitest";
import { generateSingleHtml, generateExternalHtml } from "./htmlTemplate";
import type { HtmlGeneratorInput, PageData } from "@/stores/types";
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

function makeInput(overrides?: Partial<HtmlGeneratorInput>): HtmlGeneratorInput {
  return {
    pages: [makePage()],
    orientation: "portrait",
    fontFamily: "Montserrat",
    fontWeight: 400,
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat",
    ...overrides,
  };
}

describe("generateSingleHtml", () => {
  it("generates valid HTML document", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<html lang="ja">');
    expect(html).toContain("</html>");
  });

  it("includes @page CSS with portrait size", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).toContain("@page { size: A4 portrait; margin: 0; }");
  });

  it("includes @page CSS with landscape size", () => {
    const html = generateSingleHtml(makeInput({ orientation: "landscape" }));
    expect(html).toContain("@page { size: A4 landscape; margin: 0; }");
  });

  it("includes print-color-adjust", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).toContain("print-color-adjust: exact");
    expect(html).toContain("-webkit-print-color-adjust: exact");
  });

  it("includes Google Fonts link", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).toContain(
      'href="https://fonts.googleapis.com/css2?family=Montserrat" rel="stylesheet"',
    );
  });

  it("embeds settings meta tag when provided", () => {
    const html = generateSingleHtml(makeInput(), '{"startMonth":"2026-04"}');
    expect(html).toContain('meta name="kalendar-settings"');
    expect(html).toContain("startMonth");
  });

  it("escapes settings JSON in meta tag", () => {
    const html = generateSingleHtml(makeInput(), '{"val":"<script>"}');
    expect(html).toContain("&lt;script&gt;");
  });

  it("omits settings meta tag when not provided", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).not.toContain("kalendar-settings");
  });

  it("renders multiple pages", () => {
    const input = makeInput({
      pages: [makePage({ monthLabel: "2026.04" }), makePage({ monthLabel: "2026.05" })],
    });
    const html = generateSingleHtml(input);
    expect(html).toContain("2026.04");
    expect(html).toContain("2026.05");
  });

  it("suppresses page-break on last page", () => {
    const html = generateSingleHtml(makeInput());
    expect(html).toContain(".page:last-child { page-break-after: auto; }");
  });
});

describe("generateExternalHtml", () => {
  it("replaces base64 images with external paths", () => {
    const input = makeInput({
      pages: [makePage({ imageBase64: "data:image/png;base64,abc" })],
    });
    const html = generateExternalHtml(input, "images");
    expect(html).toContain("images/00.png");
    expect(html).not.toContain("data:image/png;base64,abc");
  });

  it("uses jpg extension for jpeg images", () => {
    const input = makeInput({
      pages: [makePage({ imageBase64: "data:image/jpeg;base64,abc" })],
    });
    const html = generateExternalHtml(input, "images");
    expect(html).toContain("images/00.jpg");
  });

  it("leaves pages without images unchanged", () => {
    const input = makeInput({
      pages: [makePage({ imageBase64: null })],
    });
    const html = generateExternalHtml(input, "images");
    expect(html).not.toContain("images/");
  });

  it("numbers multiple pages correctly", () => {
    const input = makeInput({
      pages: [
        makePage({ imageBase64: "data:image/png;base64,a" }),
        makePage({ imageBase64: "data:image/png;base64,b" }),
      ],
    });
    const html = generateExternalHtml(input, "images");
    expect(html).toContain("images/00.png");
    expect(html).toContain("images/01.png");
  });
});
