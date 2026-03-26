import { describe, it, expect } from "vitest";
import { renderPage } from "./pageRenderer";
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

describe("renderPage", () => {
  it("renders portrait dimensions", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400);
    expect(html).toContain("width:210mm");
    expect(html).toContain("height:297mm");
  });

  it("renders landscape dimensions", () => {
    const html = renderPage(makePage(), "landscape", "Montserrat", 400);
    expect(html).toContain("width:297mm");
    expect(html).toContain("height:210mm");
  });

  it("applies theme background color", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400);
    expect(html).toContain(`background:${theme.colors.background}`);
  });

  it("applies font family and weight", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400);
    expect(html).toContain("font-family:'Montserrat',sans-serif");
    expect(html).toContain("font-weight:400");
  });

  it("renders page-break-after:always", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400);
    expect(html).toContain("page-break-after:always");
  });

  it("renders grid-only layout when no image", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400);
    expect(html).toContain("height:100%;padding:24px;");
    expect(html).not.toContain("object-fit:contain");
  });

  it("renders image + grid layout when image is present", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400);
    expect(html).toContain("object-fit:contain");
    expect(html).toContain("height:50%");
  });

  it("uses width for horizontal layout (left position)", () => {
    const page = makePage({
      imageBase64: "data:image/png;base64,abc",
      imagePosition: "left",
      imagePercent: 60,
    });
    const html = renderPage(page, "portrait", "Montserrat", 400);
    expect(html).toContain("width:60%");
    expect(html).toContain("width:40%");
    expect(html).toContain("flex-direction:row");
  });

  it("reverses order for bottom position", () => {
    const page = makePage({
      imageBase64: "data:image/png;base64,abc",
      imagePosition: "bottom",
    });
    const html = renderPage(page, "portrait", "Montserrat", 400);
    // Grid should come before image in the HTML (reversed)
    const gridIdx = html.indexOf("padding:16px 24px");
    const imgIdx = html.indexOf("object-fit:contain");
    expect(gridIdx).toBeLessThan(imgIdx);
  });

  it("reverses order for right position", () => {
    const page = makePage({
      imageBase64: "data:image/png;base64,abc",
      imagePosition: "right",
    });
    const html = renderPage(page, "portrait", "Montserrat", 400);
    const gridIdx = html.indexOf("padding:16px 24px");
    const imgIdx = html.indexOf("object-fit:contain");
    expect(gridIdx).toBeLessThan(imgIdx);
  });

  it("applies pageMarginTop when provided", () => {
    const html = renderPage(makePage(), "portrait", "Montserrat", 400, {
      pageMarginTop: 16,
    });
    expect(html).toContain("padding-top:16px");
  });

  it("applies contentAlignV start", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400, {
      contentAlignV: "start",
    });
    expect(html).toContain("justify-content:flex-start");
  });

  it("applies imageAlignV start as object-position top", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400, {
      imageAlignV: "start",
    });
    expect(html).toContain("object-position:top center");
  });

  it("applies imageAlignV end as object-position bottom", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400, {
      imageAlignV: "end",
    });
    expect(html).toContain("object-position:bottom center");
  });

  it("applies imageAlignH end as object-position right", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400, {
      imageAlignH: "end",
    });
    expect(html).toContain("object-position:center right");
  });

  it("defaults imageAlign to center center object-position", () => {
    const page = makePage({ imageBase64: "data:image/png;base64,abc" });
    const html = renderPage(page, "portrait", "Montserrat", 400);
    expect(html).toContain("object-position:center center");
  });

  it("escapes font family name with special chars", () => {
    const html = renderPage(makePage(), "portrait", "Noto Sans JP", 400);
    expect(html).toContain("font-family:'Noto Sans JP',sans-serif");
  });
});
