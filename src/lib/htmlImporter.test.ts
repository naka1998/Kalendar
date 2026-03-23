import { describe, it, expect } from "vitest";
import { parseSettingsFromHtml } from "./htmlImporter";

describe("parseSettingsFromHtml", () => {
  it("extracts settings from HTML with kalendar-settings meta", () => {
    const settings = JSON.stringify({
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
      imageRatio: "50:50",
      manualHolidays: [],
      removedHolidays: [],
      monthThemeOverrides: {},
      imageFileNames: {},
    });

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="kalendar-settings" content='${settings}'>
<title>Calendar</title>
</head>
<body></body>
</html>`;

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
    const settings = JSON.stringify({
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
      imageRatio: "50:50",
      manualHolidays: [],
      removedHolidays: [],
      monthThemeOverrides: {},
      imageFileNames: {},
    });

    // Simulate escaped content
    const escaped = settings.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const html = `<meta name="kalendar-settings" content='${escaped}'>`;

    const result = parseSettingsFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.startMonth).toBe("2026-04");
  });
});
