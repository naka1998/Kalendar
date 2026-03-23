import { describe, it, expect } from "vitest";
import { generateZip } from "./zipGenerator";
import type { HtmlGeneratorInput, PageData } from "@/stores/types";
import { THEMES } from "./themes";
import { getMonthGrid, getWeekdayHeaders, formatMonthLabel, enrichDayCells } from "./dateUtils";
import JSZip from "jszip";

function createTestInput(): HtmlGeneratorInput {
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
  };
  return {
    pages: [page],
    orientation: "portrait",
    fontFamily: "Montserrat",
    fontWeight: 400,
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap",
  };
}

describe("generateZip", () => {
  it("generates a valid ZIP blob", async () => {
    const blob = await generateZip(createTestInput());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("contains index.html", async () => {
    const blob = await generateZip(createTestInput());
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file("index.html")).not.toBeNull();
  });

  it("contains images folder when images are provided", async () => {
    const input = createTestInput();
    // Create a minimal base64 JPEG
    const tinyJpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    input.pages[0].imageBase64 = tinyJpeg;

    const blob = await generateZip(input);
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file("images/00.jpg")).not.toBeNull();
  });

  it("index.html references images with relative paths", async () => {
    const input = createTestInput();
    input.pages[0].imageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

    const blob = await generateZip(input);
    const zip = await JSZip.loadAsync(blob);
    const html = await zip.file("index.html")!.async("string");
    expect(html).toContain("images/00.jpg");
    expect(html).not.toContain("data:image/jpeg;base64");
  });
});
