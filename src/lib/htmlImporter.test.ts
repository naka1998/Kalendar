import { describe, it, expect } from "vitest";
import { parseSettingsFromHtml, parseImagesFromHtml } from "./htmlImporter";

const BASE_SETTINGS = {
  version: 1,
  startMonth: "2026-04",
  endMonth: "2027-03",
  orientation: "portrait",
  weekStart: "sunday",
  weekdayFormat: "en-short",
  monthLabelFormat: "yyyy.mm",
  pageLayout: "1-month",
  holidayMarkStyle: "dot",
  themeId: "classic",
  fontId: "montserrat",
  fontWeight: 400,
  imagePercent: 50,
  imagePosition: "top",
  manualHolidays: [],
  removedHolidays: [],
  monthThemeOverrides: {},
  imageFileNames: {},
};

function buildHtml(
  settings: Record<string, unknown>,
  pages: { hasImage: boolean; mimeType?: string }[] = [],
): string {
  const settingsJson = JSON.stringify(settings);
  const pagesHtml = pages
    .map((p) => {
      const imgTag = p.hasImage
        ? `<img src="data:${p.mimeType ?? "image/jpeg"};base64,AAAA" style="width:100%;height:100%;object-fit:contain" />`
        : "";
      return `<div class="page">${imgTag}</div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="kalendar-settings" content='${settingsJson}'>
<title>Calendar</title>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

describe("parseSettingsFromHtml", () => {
  it("extracts settings from HTML with kalendar-settings meta", () => {
    const html = buildHtml(BASE_SETTINGS);
    const result = parseSettingsFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.startMonth).toBe("2026-04");
    expect(result?.themeId).toBe("classic");
  });

  it("returns null for HTML without settings meta", () => {
    const html = `<!DOCTYPE html><html><head></head><body></body></html>`;
    expect(parseSettingsFromHtml(html)).toBeNull();
  });

  it("handles escaped HTML entities in JSON", () => {
    const settings = JSON.stringify(BASE_SETTINGS);
    const escaped = settings.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const html = `<meta name="kalendar-settings" content='${escaped}'>`;

    const result = parseSettingsFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.startMonth).toBe("2026-04");
  });
});

describe("parseImagesFromHtml", () => {
  it("extracts images from HTML pages", () => {
    const settings = {
      ...BASE_SETTINGS,
      startMonth: "2026-04",
      endMonth: "2026-06",
      imageFileNames: { "2026-04": "april.jpg", "2026-05": "may.jpg" },
    };
    const html = buildHtml(settings, [{ hasImage: true }, { hasImage: true }, { hasImage: false }]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-06", settings.imageFileNames);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result["2026-04"]).toMatchObject({
      monthKey: "2026-04",
      fileName: "april.jpg",
      mimeType: "image/jpeg",
    });
    expect(result["2026-04"].base64).toContain("data:image/jpeg;base64,");
    expect(result["2026-05"]).toMatchObject({
      monthKey: "2026-05",
      fileName: "may.jpg",
      mimeType: "image/jpeg",
    });
    expect(result["2026-06"]).toBeUndefined();
  });

  it("returns empty record when no images present", () => {
    const html = buildHtml(BASE_SETTINGS, [{ hasImage: false }, { hasImage: false }]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-05", {});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("correctly extracts png mimeType", () => {
    const html = buildHtml(BASE_SETTINGS, [{ hasImage: true, mimeType: "image/png" }]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-04", {});
    expect(result["2026-04"].mimeType).toBe("image/png");
  });

  it("uses fallback fileName when imageFileNames is empty", () => {
    const html = buildHtml(BASE_SETTINGS, [{ hasImage: true }]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-04", {});
    expect(result["2026-04"].fileName).toBe("image-2026-04.jpg");
  });

  it("handles partial images (some months with, some without)", () => {
    const html = buildHtml(BASE_SETTINGS, [
      { hasImage: false },
      { hasImage: true },
      { hasImage: false },
      { hasImage: true, mimeType: "image/png" },
    ]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-07", {});
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["2026-05"]).toBeDefined();
    expect(result["2026-07"]).toBeDefined();
    expect(result["2026-04"]).toBeUndefined();
    expect(result["2026-06"]).toBeUndefined();
  });

  it("ignores pages beyond month range", () => {
    const html = buildHtml(BASE_SETTINGS, [
      { hasImage: true },
      { hasImage: true },
      { hasImage: true },
    ]);

    const result = parseImagesFromHtml(html, "2026-04", "2026-05", {});
    expect(Object.keys(result)).toHaveLength(2);
  });
});
