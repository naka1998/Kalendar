import { importSettings } from "./settingsExport";
import { generateMonthRange } from "./dateUtils";
import { unescapeHtml } from "./htmlUtils";
import type { CalendarState, MonthImage } from "@/stores/types";

function extractSettingsJson(html: string): string | null {
  const match = html.match(/<meta\s+name="kalendar-settings"\s+content='([^']*)'/);
  if (!match?.[1]) return null;
  return unescapeHtml(match[1]);
}

export function parseSettingsFromHtml(html: string): ReturnType<typeof importSettings> | null {
  const json = extractSettingsJson(html);
  if (!json) return null;
  return importSettings(json);
}

function parseRawSettingsJson(html: string): Record<string, unknown> | null {
  const json = extractSettingsJson(html);
  if (!json) return null;
  return JSON.parse(json) as Record<string, unknown>;
}

export function parseImagesFromHtml(
  html: string,
  startMonth: string,
  endMonth: string,
  imageFileNames: Record<string, string>,
): Record<string, MonthImage> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const pages = doc.querySelectorAll(".page");
  const months = generateMonthRange(startMonth, endMonth);
  const images: Record<string, MonthImage> = {};

  pages.forEach((page, i) => {
    if (i >= months.length) return;
    const img = page.querySelector('img[src^="data:image/"]');
    if (!img) return;

    const src = img.getAttribute("src")!;
    const mimeMatch = src.match(/^data:(image\/[^;]+);/);
    const mimeType = mimeMatch?.[1] ?? "image/jpeg";
    const monthKey = months[i];

    images[monthKey] = {
      id: `imported-${monthKey}`,
      monthKey,
      fileName: imageFileNames[monthKey] ?? `image-${monthKey}.jpg`,
      base64: src,
      mimeType,
    };
  });

  return images;
}

export function importFromHtmlFile(file: File): Promise<Partial<CalendarState> | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const html = reader.result as string;
        const settings = parseSettingsFromHtml(html);
        if (!settings) {
          resolve(null);
          return;
        }

        const raw = parseRawSettingsJson(html);
        const imageFileNames = (raw?.imageFileNames as Record<string, string>) ?? {};
        const startMonth = settings.startMonth ?? "2026-04";
        const endMonth = settings.endMonth ?? "2027-03";

        const images = parseImagesFromHtml(html, startMonth, endMonth, imageFileNames);
        const hasImages = Object.keys(images).length > 0;

        resolve({
          ...settings,
          ...(hasImages ? { images, useImages: true } : {}),
        });
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
