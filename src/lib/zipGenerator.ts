import JSZip from "jszip";
import type { HtmlGeneratorInput } from "@/stores/types";
import { generateExternalHtml } from "./htmlGenerator";

function base64ToBlob(dataUrl: string): { blob: Uint8Array; ext: string } {
  const [header, data] = dataUrl.split(",");
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const ext = header.includes("png") ? "png" : "jpg";
  return { blob: bytes, ext };
}

export async function generateZip(input: HtmlGeneratorInput): Promise<Blob> {
  const zip = new JSZip();

  // Add images
  const imageFolder = "images";
  for (let i = 0; i < input.pages.length; i++) {
    const page = input.pages[i];
    if (page.imageBase64 && page.imageBase64.startsWith("data:")) {
      const { blob, ext } = base64ToBlob(page.imageBase64);
      zip.file(`${imageFolder}/${String(i).padStart(2, "0")}.${ext}`, blob);
    }
  }

  // Generate HTML with relative image paths
  const html = generateExternalHtml(input, imageFolder);
  zip.file("index.html", html);

  return zip.generateAsync({ type: "blob" });
}
