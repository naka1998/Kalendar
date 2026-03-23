import { importSettings } from "./settingsExport";
import type { CalendarState } from "@/stores/types";

export function parseSettingsFromHtml(html: string): ReturnType<typeof importSettings> | null {
  // Extract kalendar-settings meta tag content
  const match = html.match(/<meta\s+name="kalendar-settings"\s+content='([^']*)'/);
  if (!match?.[1]) return null;

  // Unescape HTML entities
  const json = match[1]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  return importSettings(json);
}

export function importFromHtmlFile(file: File): Promise<Partial<CalendarState> | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const html = reader.result as string;
        const settings = parseSettingsFromHtml(html);
        resolve(settings);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
