import { IMAGE } from "@/lib/constants";

export interface ImageResizer {
  loadImage(dataUrl: string): Promise<{ width: number; height: number }>;
  toDataURL(
    dataUrl: string,
    width: number,
    height: number,
    mimeType: string,
    quality: number,
  ): Promise<string>;
}

/* v8 ignore start -- browser-only Image/Canvas APIs, tested via E2E */
const defaultResizer: ImageResizer = {
  loadImage(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
  },
  toDataURL(
    dataUrl: string,
    width: number,
    height: number,
    mimeType: string,
    quality: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  },
};
/* v8 ignore stop */

export interface ResizeResult {
  base64: string;
  mimeType: string;
  aspectRatio: number;
}

export function calcResizeDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longSide = Math.max(width, height);
  if (longSide <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export interface ImageProcessor {
  resizeImage(file: File): Promise<ResizeResult>;
}

export function createImageProcessor(resizer: ImageResizer = defaultResizer): ImageProcessor {
  return {
    async resizeImage(file: File): Promise<ResizeResult> {
      // Validate file size
      if (file.size > IMAGE.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${IMAGE.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      }

      // Validate MIME type
      if (!(IMAGE.ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}. Only JPEG and PNG are accepted.`);
      }

      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Load image to get dimensions
      const { width, height } = await resizer.loadImage(dataUrl);

      // Calculate resize dimensions
      const resized = calcResizeDimensions(width, height, IMAGE.MAX_DIMENSION);

      const aspectRatio = width / height;

      // If no resize needed, return original
      if (resized.width === width && resized.height === height) {
        return { base64: dataUrl, mimeType: file.type, aspectRatio };
      }

      // Resize
      const base64 = await resizer.toDataURL(
        dataUrl,
        resized.width,
        resized.height,
        file.type,
        IMAGE.JPEG_QUALITY,
      );

      return { base64, mimeType: file.type, aspectRatio };
    },
  };
}
