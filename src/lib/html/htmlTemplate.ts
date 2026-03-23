import type { HtmlGeneratorInput } from "@/stores/types";
import { escapeHtml } from "../htmlUtils";
import { renderPage } from "./pageRenderer";

export function generateSingleHtml(input: HtmlGeneratorInput, settingsJson?: string): string {
  const { pages, orientation, fontFamily, fontWeight, googleFontsUrl } = input;
  const size = orientation === "portrait" ? "A4 portrait" : "A4 landscape";

  let pagesHtml = "";
  for (const page of pages) {
    pagesHtml += renderPage(page, orientation, fontFamily, fontWeight, input.calendarStyle);
  }

  const settingsMeta = settingsJson
    ? `\n<meta name="kalendar-settings" content='${escapeHtml(settingsJson)}'>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">${settingsMeta}
<title>Calendar</title>
<link href="${escapeHtml(googleFontsUrl)}" rel="stylesheet">
<style>
@page { size: ${size}; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.page:last-child { page-break-after: auto; }
</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

export function generateExternalHtml(input: HtmlGeneratorInput, imageFolder: string): string {
  const modifiedPages = input.pages.map((page, i) => {
    if (!page.imageBase64) return page;
    const ext = page.imageBase64.startsWith("data:image/png") ? "png" : "jpg";
    return {
      ...page,
      imageBase64: `${imageFolder}/${String(i).padStart(2, "0")}.${ext}`,
    };
  });
  return generateSingleHtml({ ...input, pages: modifiedPages });
}
